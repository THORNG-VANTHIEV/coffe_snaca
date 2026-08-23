import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AboutPage } from '@/features/about/AboutPage'
import { HomePage } from '@/features/home/HomePage'
import { MenuPage } from '@/features/menu/MenuPage'
import { NotFoundPage } from '@/features/menu/NotFoundPage'
import { ProductDetailPage } from '@/features/product/ProductDetailPage'

/**
 * `/search?q=…` forwards to the menu page search view.
 */
function SearchRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/menu${search}`} replace />
}

/**
 * `/category/:slug` seamlessly forwards to the continuous menu section anchor.
 */
function CategoryRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/menu?category=${slug}#category-${slug}`} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:slug" element={<ProductDetailPage />} />
        <Route path="category/:slug" element={<CategoryRedirect />} />
        <Route path="search" element={<SearchRedirect />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
