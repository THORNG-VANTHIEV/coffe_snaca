import { useEffect, useState } from 'react'
import { Coffee } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * The shop mark, with a coffee glyph standing in whenever the logo file is
 * missing — the header must never show a broken image (spec §39).
 */
export function ShopLogo({
  src,
  name,
  className,
}: {
  src: string
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(!src)

  useEffect(() => setFailed(!src), [src])

  // On the splash screen the shop name is not loaded yet, so the mark is
  // purely decorative there.
  const decorative = name === ''

  if (failed) {
    return (
      <span
        className={cn(
          'grid aspect-square shrink-0 place-items-center rounded-pill bg-primary text-on-primary',
          className,
        )}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : name}
        aria-hidden={decorative || undefined}
      >
        <Coffee className="size-1/2" aria-hidden="true" />
      </span>
    )
  }

  // The logo is a wordmark (it already spells out the shop name), not an
  // icon — `w-auto` + `object-contain` show it at its own aspect ratio
  // instead of cropping it into a square.
  return (
    <img
      src={src}
      alt={name}
      width={238}
      height={80}
      onError={() => setFailed(true)}
      className={cn('w-auto shrink-0 rounded-md object-contain', className)}
    />
  )
}
