import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'outline' | 'ghost' | 'onImage'
type Size = 'sm' | 'md'

/**
 * Variants are declared here rather than patched in through `className`:
 * Tailwind resolves competing utilities by the order it emits them, not by
 * the order they appear in the attribute, so an override like
 * `text-[#251A14]` on top of `text-on-primary` silently loses.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:opacity-90 shadow-card',
  // `border-interactive`, not the decorative hairline: on light backgrounds
  // the button's fill is nearly the page colour, so the border is the only
  // thing marking its bounds.
  outline: 'border border-border-interactive bg-surface text-text hover:bg-surface-2',
  ghost: 'text-text hover:bg-surface-2',
  // Sits on the hero photograph, which is dark in both themes.
  onImage: 'bg-white text-[#251A14] shadow-card hover:bg-white/90',
}

/** 44px minimum touch target on the default size (spec §47). */
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'min-h-11 px-5 text-sm gap-2',
}

function buttonStyles(variant: Variant = 'primary', size: Size = 'md'): string {
  return cn(
    'inline-flex items-center justify-center rounded-pill font-medium',
    'transition duration-[var(--motion-fast)] ease-out active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles(variant, size), className)} {...props} />
}

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonStyles(variant, size), className)} {...props} />
}
