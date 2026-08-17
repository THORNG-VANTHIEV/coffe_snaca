import { useEffect, useRef, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/utils/cn'
import { resolveAssetUrl } from '@/utils/url'

const FALLBACK_SRC = resolveAssetUrl('/images/default-product.webp')

interface ImageWithFallbackProps {
  src: string
  alt: string
  /**
   * Applied to the wrapper — aspect ratio, rounding, and any dimming for a
   * sold-out product go here.
   */
  className?: string
  /**
   * Applied to the `<img>`. Keep it to transforms (a hover zoom); the fade-in
   * owns opacity and the transition.
   */
  imageClassName?: string
  /** Hero and above-the-fold art loads eagerly; everything else lazily (spec §48). */
  priority?: boolean
  sizes?: string
}

/**
 * Menu photography with a graceful degradation path (spec §39):
 * real image → shop's default photo → a neutral icon tile.
 * A broken-image glyph is never shown.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes,
}: ImageWithFallbackProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [source, setSource] = useState(src || FALLBACK_SRC)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setSource(src || FALLBACK_SRC)
    setLoaded(false)
    setFailed(false)
  }, [src])

  // A cached image can finish before React attaches onLoad, which would leave
  // it stuck at opacity 0.
  useEffect(() => {
    if (imageRef.current?.complete) setLoaded(true)
  }, [source])

  function handleError() {
    if (source !== FALLBACK_SRC) {
      setSource(FALLBACK_SRC)
      return
    }
    setFailed(true)
  }

  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {!loaded && !failed && <div className="absolute inset-0 skeleton" aria-hidden="true" />}

      {failed ? (
        <div
          className="absolute inset-0 grid place-items-center bg-surface-2 text-muted"
          // A decorative image (alt="") stays decorative when it falls back.
          role={alt ? 'img' : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
        >
          <ImageOff className="size-7 opacity-60" aria-hidden="true" />
        </div>
      ) : (
        <img
          ref={imageRef}
          src={source}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          // Inline, so a caller's utility class can never win over the fade by
          // being emitted later in the stylesheet.
          style={{ opacity: loaded ? 1 : 0 }}
          className={cn(
            'image-reveal size-full object-cover',
            imageClassName,
          )}
        />
      )}
    </div>
  )
}
