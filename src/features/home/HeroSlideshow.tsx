import { useEffect, useState } from 'react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/utils/cn'

/** How long each slide is held, and how long the cross-fade between them takes. */
const SLIDE_MS = 5000
const FADE_MS = 900

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/**
 * Looping cross-fade of hero banners (5s per slide).
 *
 * Purely decorative: the headline sits above it and carries all the meaning,
 * so the slides are `alt=""` and the whole stack is hidden from assistive
 * technology. There is no live region and no pause control to clutter the
 * header — instead the loop simply does not start for anyone who has asked
 * for reduced motion, which is the population an auto-advancing background
 * actually bothers.
 *
 * Slides are mounted one ahead of the one being shown rather than all at
 * once. The first paint then costs a single banner instead of four, which
 * matters on the mobile connection this app is designed for (spec §48), and
 * the next image is always already decoded before it fades in.
 */
export function HeroSlideshow({ images }: { images: string[] }) {
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION)
  const [active, setActive] = useState(0)
  const [mountedCount, setMountedCount] = useState(() => Math.min(2, images.length))

  const animating = images.length > 1 && !prefersReducedMotion

  useEffect(() => {
    if (!animating) return

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length)
    }, SLIDE_MS)

    return () => window.clearInterval(timer)
  }, [animating, images.length])

  // Keep one slide loaded ahead of the visible one.
  useEffect(() => {
    setMountedCount((count) => Math.min(images.length, Math.max(count, active + 2)))
  }, [active, images.length])

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {images.slice(0, mountedCount).map((image, index) => (
        <div
          key={image}
          className={cn(
            'absolute inset-0 transition-opacity ease-in-out',
            index === active ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <ImageWithFallback
            src={image}
            alt=""
            priority={index === 0}
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="size-full"
          />
        </div>
      ))}
    </div>
  )
}
