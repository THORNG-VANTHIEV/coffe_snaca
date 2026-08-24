import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Makes `db.json` the single source of the shop's identity.
 *
 * The React app already reads the name from the menu data, but `index.html`
 * and the web manifest are static files served before any JavaScript runs —
 * the browser tab, the social preview card and the "Add to Home Screen" name
 * all come from them. Left hardcoded they quietly keep the old shop name
 * forever, which is exactly the kind of thing the spec's §55 workflow says
 * must never need a source edit.
 *
 * So index.html carries `{{TOKENS}}` and this plugin fills them in, and the
 * manifest is generated rather than committed. `{{…}}` is used rather than
 * Vite's own `%VAR%` syntax so the two substitution passes cannot collide.
 */

interface ShopIdentity {
  name: string
  nameKm: string
  shortName: string
  tagline: string
  description: string
}

const FALLBACK: ShopIdentity = {
  name: 'Coffee Menu',
  nameKm: 'ម៉ឺនុយកាហ្វេ',
  shortName: 'Menu',
  tagline: '',
  description: 'Digital menu.',
}

/** "SNACA COFFE" → "SNACA": manifests want a short name for the home screen. */
function toShortName(name: string): string {
  if (name.length <= 12) return name
  return name.split(/\s+/)[0]?.slice(0, 12) || name.slice(0, 12)
}

function readIdentity(root: string): ShopIdentity {
  let settings: Record<string, unknown>
  try {
    const raw = readFileSync(join(root, 'public/data/db.json'), 'utf8')
    const parsed: unknown = JSON.parse(raw)
    settings =
      typeof parsed === 'object' && parsed !== null && 'settings' in parsed
        ? ((parsed as { settings: Record<string, unknown> }).settings ?? {})
        : {}
  } catch {
    // `npm run validate` is what reports a broken db.json; the build should
    // not die here with a stack trace.
    return FALLBACK
  }

  const read = (key: string): string =>
    typeof settings[key] === 'string' ? (settings[key] as string).trim() : ''

  const nameEn = read('shop_name_en')
  const nameKm = read('shop_name_km')
  const name = nameEn || nameKm || FALLBACK.name
  const tagline = read('tagline_en') || read('tagline_km')

  return {
    name,
    nameKm: nameKm || name,
    shortName: toShortName(name),
    tagline,
    // Composed rather than authored, so adding a shop means filling in no
    // extra SEO field.
    description: [
      tagline,
      `Browse the ${name} menu in Khmer and English, with prices in USD and KHR.`,
    ]
      .filter(Boolean)
      .join(' '),
  }
}

/** Escapes text going into an HTML attribute or a text node. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildManifest(identity: ShopIdentity, themeColor: string): string {
  return `${JSON.stringify(
    {
      name: `${identity.name} — Digital Menu`,
      short_name: identity.shortName,
      description: identity.description,
      // Relative so the manifest works under any base path.
      start_url: '.',
      scope: '.',
      display: 'standalone',
      orientation: 'portrait',
      background_color: themeColor,
      theme_color: themeColor,
      lang: 'km',
      icons: [
        {
          src: 'favicon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        // Same wordmark, pulled inside the safe zone: a maskable icon is
        // cropped to whatever shape the launcher wants.
        {
          src: 'icon-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    null,
    2,
  )}\n`
}

const MANIFEST_FILE = 'manifest.webmanifest'

export function shopIdentity(themeColor = '#1A110B'): Plugin {
  let root = process.cwd()

  return {
    name: 'shop-identity',

    configResolved(config) {
      root = config.root
    },

    transformIndexHtml(html) {
      const identity = readIdentity(root)
      const tokens: Record<string, string> = {
        SHOP_NAME: identity.name,
        SHOP_NAME_KM: identity.nameKm,
        SHOP_TAGLINE: identity.tagline,
        SHOP_DESCRIPTION: identity.description,
      }

      return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
        key in tokens ? escapeHtml(tokens[key] ?? '') : match,
      )
    },

    // Dev has no `public/manifest.webmanifest` to serve, so serve it here —
    // otherwise the browser logs a failed manifest fetch on every page load.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0] ?? ''
        if (!path.endsWith(`/${MANIFEST_FILE}`)) return next()

        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(buildManifest(readIdentity(root), themeColor))
      })
    },

    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: MANIFEST_FILE,
        source: buildManifest(readIdentity(root), themeColor),
      })
    },
  }
}
