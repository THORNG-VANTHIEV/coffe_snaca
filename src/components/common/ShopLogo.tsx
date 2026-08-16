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
          'grid shrink-0 place-items-center rounded-pill bg-primary text-on-primary',
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

  return (
    <img
      src={src}
      alt={name}
      width={80}
      height={80}
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-pill object-cover', className)}
    />
  )
}
