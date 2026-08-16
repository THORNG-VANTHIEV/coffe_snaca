import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { AboutPage } from '@/features/about/AboutPage'
import { CategoryPage } from '@/features/categories/CategoryPage'
import { HomePage } from '@/features/home/HomePage'
import { MenuPage } from '@/features/menu/MenuPage'
import { NotFoundPage } from '@/features/menu/NotFoundPage'
import { ProductDetailPage } from '@/features/product/ProductDetailPage'

/**
 * `/search?q=…` is kept as a working entry point (spec §27) but the menu page
 * already searches, so it forwards there rather than duplicating the view.
 */
function SearchRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/menu${search}`} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:slug" element={<ProductDetailPage />} />
        <Route path="category/:slug" element={<CategoryPage />} />
        <Route path="search" element={<SearchRedirect />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
