import { deflateSync } from 'node:zlib'

/**
 * A tiny software canvas + PNG encoder, with no dependencies.
 *
 * It exists so `generate-images.mjs` can produce real artwork for every image
 * path in db.json without adding an image library to a project whose whole
 * point is that it ships as static files.
 *
 * Shapes are drawn from signed distances and blended with a one-pixel falloff,
 * which gives clean antialiasing without supersampling.
 */

export function createCanvas(width, height) {
  return {
    width,
    height,
    // Linear 0..1 RGB, three floats per pixel.
    data: new Float64Array(width * height * 3),
  }
}

function setPixel(canvas, index, r, g, b, alpha) {
  if (alpha <= 0) return
  const a = alpha > 1 ? 1 : alpha
  const i = index * 3
  canvas.data[i] += (r - canvas.data[i]) * a
  canvas.data[i + 1] += (g - canvas.data[i + 1]) * a
  canvas.data[i + 2] += (b - canvas.data[i + 2]) * a
}

/** "#RRGGBB" → [r, g, b] in 0..1. */
export function hex(value) {
  const n = parseInt(value.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** Linear gradient across the frame. `angle` is in radians, 0 = left→right. */
export function fillGradient(canvas, from, to, angle = Math.PI / 2.6) {
  const { width, height, data } = canvas
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  // Longest projection of the frame onto the gradient axis, so t spans 0..1.
  const span = Math.abs(dx) * width + Math.abs(dy) * height
  const originX = dx < 0 ? width : 0
  const originY = dy < 0 ? height : 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = ((x - originX) * dx + (y - originY) * dy) / span
      const [r, g, b] = mix(from, to, t < 0 ? 0 : t > 1 ? 1 : t)
      const i = (y * width + x) * 3
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
    }
  }
}

/** Soft light source; `strength` is the peak opacity at the centre. */
export function radialGlow(canvas, cx, cy, radius, color, strength = 0.5) {
  const { width, height } = canvas
  const minX = Math.max(0, Math.floor(cx - radius))
  const maxX = Math.min(width - 1, Math.ceil(cx + radius))
  const minY = Math.max(0, Math.floor(cy - radius))
  const maxY = Math.min(height - 1, Math.ceil(cy + radius))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / radius
      if (d >= 1) continue
      const falloff = (1 - d) * (1 - d)
      setPixel(canvas, y * width + x, color[0], color[1], color[2], falloff * strength)
    }
  }
}

export function disc(canvas, cx, cy, radius, color, alpha = 1) {
  const { width, height } = canvas
  const minX = Math.max(0, Math.floor(cx - radius - 1))
  const maxX = Math.min(width - 1, Math.ceil(cx + radius + 1))
  const minY = Math.max(0, Math.floor(cy - radius - 1))
  const maxY = Math.min(height - 1, Math.ceil(cy + radius + 1))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
      const coverage = radius + 0.5 - d
      if (coverage <= 0) continue
      setPixel(canvas, y * width + x, color[0], color[1], color[2], Math.min(coverage, 1) * alpha)
    }
  }
}

export function ring(canvas, cx, cy, radius, thickness, color, alpha = 1) {
  const { width, height } = canvas
  const outer = radius + thickness / 2
  const minX = Math.max(0, Math.floor(cx - outer - 1))
  const maxX = Math.min(width - 1, Math.ceil(cx + outer + 1))
  const minY = Math.max(0, Math.floor(cy - outer - 1))
  const maxY = Math.min(height - 1, Math.ceil(cy + outer + 1))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = Math.abs(Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - radius)
      const coverage = thickness / 2 + 0.5 - d
      if (coverage <= 0) continue
      setPixel(canvas, y * width + x, color[0], color[1], color[2], Math.min(coverage, 1) * alpha)
    }
  }
}

/** Axis-aligned rounded rectangle, used for the steam wisps and plates. */
export function roundedRect(canvas, x0, y0, w, h, radius, color, alpha = 1) {
  const { width, height } = canvas
  const cx = x0 + w / 2
  const cy = y0 + h / 2
  const halfW = w / 2 - radius
  const halfH = h / 2 - radius

  const minX = Math.max(0, Math.floor(x0 - 1))
  const maxX = Math.min(width - 1, Math.ceil(x0 + w + 1))
  const minY = Math.max(0, Math.floor(y0 - 1))
  const maxY = Math.min(height - 1, Math.ceil(y0 + h + 1))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = Math.max(Math.abs(x + 0.5 - cx) - halfW, 0)
      const dy = Math.max(Math.abs(y + 0.5 - cy) - halfH, 0)
      const coverage = radius + 0.5 - Math.hypot(dx, dy)
      if (coverage <= 0) continue
      setPixel(canvas, y * width + x, color[0], color[1], color[2], Math.min(coverage, 1) * alpha)
    }
  }
}

/** Darkens the edges so the subject sits forward. */
export function vignette(canvas, strength = 0.3) {
  const { width, height, data } = canvas
  const cx = width / 2
  const cy = height / 2
  const max = Math.hypot(cx, cy)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / max
      const factor = 1 - strength * d * d
      const i = (y * width + x) * 3
      data[i] *= factor
      data[i + 1] *= factor
      data[i + 2] *= factor
    }
  }
}

/** Deterministic film grain, so regenerating produces identical bytes. */
export function grain(canvas, amount = 0.02, seed = 1) {
  const { data } = canvas
  let state = seed >>> 0 || 1

  for (let i = 0; i < data.length; i += 3) {
    // xorshift32
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    const noise = (state / 0xffffffff - 0.5) * amount
    data[i] += noise
    data[i + 1] += noise
    data[i + 2] += noise
  }
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i++) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, payload) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(payload.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), payload])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/** Encodes the canvas as an 8-bit RGB PNG. */
export function encodePng(canvas) {
  const { width, height, data } = canvas
  const stride = width * 3
  const raw = Buffer.alloc((stride + 1) * height)

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1)
    raw[rowStart] = 0 // filter: none
    for (let x = 0; x < stride; x++) {
      const value = data[y * stride + x]
      raw[rowStart + 1 + x] = value <= 0 ? 0 : value >= 1 ? 255 : Math.round(value * 255)
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bit depth
  header[9] = 2 // colour type: truecolour
  header[10] = 0
  header[11] = 0
  header[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

/** Stable 32-bit hash, used to vary artwork per product slug. */
export function hashString(value) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
