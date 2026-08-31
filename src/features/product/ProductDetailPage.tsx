import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChefHat,
  Flame,
  Info,
  Leaf,
  type LucideIcon,
  PlusCircle,
  Ruler,
  Snowflake,
  Sparkles,
  Thermometer,
} from 'lucide-react'
import type { Temperature } from '@/models'
import { hasDrinkOptions } from '@/models'
import { Button, ButtonLink } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { SectionHeading } from '@/components/common/SectionHeading'
import { AvailabilityBadge } from '@/components/menu/AvailabilityBadge'
import { DiscountBadge } from '@/components/menu/DiscountBadge'
import { PriceDisplay } from '@/components/menu/PriceDisplay'
import { ProductBadge } from '@/components/menu/ProductBadge'
import { ProductRail } from '@/components/menu/ProductRail'
import { OptionChips, OptionSection, type OptionItem } from './OptionSection'
import { useLanguage } from '@/hooks/useLanguage'
import { useCategories, useProducts, useSettings } from '@/hooks/useMenu'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  findProductBySlug,
  getRelatedProducts,
  indexCategoriesById,
} from '@/services/menuSelectors'
import { activeDiscount } from '@/services/promotion'
import { cn } from '@/utils/cn'
import { formatPriceDelta } from '@/utils/currency'
import {
  categoryName,
  extraName,
  optionGroupName,
  optionValueName,
  productAltName,
  productDescription,
  productIngredients,
  productName,
  shopName,
  sizeName,
} from '@/utils/translation'

const TEMPERATURE_ICONS: Record<Temperature, LucideIcon> = {
  hot: Flame,
  iced: Snowflake,
}

/**
 * Returns to wherever the customer came from, or to the menu when the product
 * was opened directly from a QR link (React Router marks the first history
 * entry of a session with the key "default").
 */
function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()

  const canGoBack = location.key !== 'default'

  if (!canGoBack) {
    return (
      <ButtonLink to="/menu" variant="ghost" size="sm" className="-ms-3">
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t.states.backToMenu}
      </ButtonLink>
    )
  }

  return (
    <Button variant="ghost" size="sm" className="-ms-3" onClick={() => navigate(-1)}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t.common.back}
    </Button>
  )
}

/** Product details (spec §13, §60). */
export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const settings = useSettings()
  const products = useProducts()
  const categories = useCategories()
  const { language, t } = useLanguage()

  const product = findProductBySlug(products, slug)

  const name = product ? productName(product, language) : t.states.productNotFoundTitle
  useDocumentTitle(`${name} | ${shopName(settings, language)}`)

  const related = useMemo(
    () => (product ? getRelatedProducts(products, product) : []),
    [products, product],
  )

  const discount = product ? activeDiscount(product, settings) : 0

  if (!product) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title={t.states.productNotFoundTitle}
          body={t.states.productNotFoundBody}
          action={
            <ButtonLink to="/menu" className="mt-2">
              {t.states.backToMenu}
            </ButtonLink>
          }
        />
      </div>
    )
  }

  const category = indexCategoriesById(categories).get(product.categoryId)
  const altName = productAltName(product, language)
  const description = productDescription(product, language)
  const ingredients = productIngredients(product, language)
  const sizeLabel = category?.kind === 'food' ? t.product.portion : t.product.sizes
  const showOptionsNote = hasDrinkOptions(product) || product.options.length > 0

  const temperatureItems: OptionItem[] = product.temperature.map((value) => ({
    key: value,
    label: t.temperature[value],
    icon: TEMPERATURE_ICONS[value],
  }))

  const sugarItems: OptionItem[] = product.sugarLevels.map((level) => ({
    key: String(level),
    label: `${level}%`,
  }))

  const iceItems: OptionItem[] = product.iceLevels.map((level) => ({
    key: level,
    label: t.ice[level],
  }))

  const extraItems: OptionItem[] = product.extras.map((extra) => ({
    key: extra.nameEn,
    label: extraName(extra, language),
    hint: formatPriceDelta(extra.price, settings),
  }))

  const ingredientItems: OptionItem[] = ingredients.map((ingredient) => ({
    key: ingredient,
    label: ingredient,
  }))

  return (
    <div className="container-page py-4 sm:py-6">
      <BackButton />

      <article className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-card border border-border/70 shadow-card">
            <ImageWithFallback
              src={product.image}
              alt={name}
              priority
              fit="cover"
              sizes="(min-width: 1024px) 600px, 100vw"
              className={cn(
                'aspect-4/3 w-full',
                !product.available && 'opacity-55 grayscale-35',
              )}
            />

            {(product.bestSeller || product.recommended || product.featured) && (
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.bestSeller && <ProductBadge kind="bestSeller" />}
                {product.recommended && <ProductBadge kind="recommended" />}
                {product.featured && <ProductBadge kind="featured" />}
              </div>
            )}

            {discount > 0 && (
              <div className="absolute top-4 end-4">
                <DiscountBadge percent={discount} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-3">
            {category && (
              <Link
                to={`/category/${category.slug}`}
                className="w-fit text-xs font-medium text-accent-strong underline-offset-4 hover:underline"
              >
                {categoryName(category, language)}
              </Link>
            )}

            <div>
              <h1 className="text-2xl leading-tight font-semibold text-text sm:text-3xl">
                {name}
              </h1>
              {altName && altName !== name && (
                <p className="mt-1 text-sm text-muted" lang={language === 'km' ? 'en' : 'km'}>
                  {altName}
                </p>
              )}
            </div>

            <AvailabilityBadge available={product.available} className="w-fit" />

            {description && (
              <p className="text-[15px] leading-relaxed text-muted">{description}</p>
            )}
          </header>

          <section className="rounded-card border border-border bg-surface-2/60 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
              <Ruler className="size-4 text-accent" aria-hidden="true" />
              {sizeLabel}
            </h2>

            {product.sizes.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {product.sizes.map((size) => (
                  <li
                    key={size.code}
                    className="flex items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3"
                  >
                    <span className="text-sm font-medium text-text">
                      {sizeName(size, language)}
                    </span>
                    <PriceDisplay price={size.price} size="md" discountPercent={discount} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">—</p>
            )}
          </section>

          {temperatureItems.length > 0 && (
            <OptionSection icon={Thermometer} title={t.product.temperature}>
              <OptionChips items={temperatureItems} />
            </OptionSection>
          )}

          {sugarItems.length > 0 && (
            <OptionSection icon={Sparkles} title={t.product.sugar}>
              <OptionChips items={sugarItems} />
            </OptionSection>
          )}

          {iceItems.length > 0 && (
            <OptionSection icon={Snowflake} title={t.product.ice}>
              <OptionChips items={iceItems} />
            </OptionSection>
          )}

          {product.options.map((group) => (
            <OptionSection key={group.key} icon={ChefHat} title={optionGroupName(group, language)}>
              <OptionChips
                items={group.values.map((value) => ({
                  key: value.nameEn,
                  label: optionValueName(value, language),
                }))}
              />
            </OptionSection>
          ))}

          {extraItems.length > 0 && (
            <OptionSection icon={PlusCircle} title={t.product.extras}>
              <OptionChips items={extraItems} />
            </OptionSection>
          )}

          {ingredientItems.length > 0 && (
            <OptionSection icon={Leaf} title={t.product.ingredients}>
              <OptionChips items={ingredientItems} />
            </OptionSection>
          )}

          {showOptionsNote && (
            <p className="flex items-start gap-2 rounded-card bg-surface-2/60 p-3 text-xs leading-relaxed text-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              {t.product.optionsNote}
            </p>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related-heading">
          <SectionHeading id="related-heading" icon={Sparkles} title={t.sections.related} />
          <ProductRail products={related} />
        </section>
      )}
    </div>
  )
}
