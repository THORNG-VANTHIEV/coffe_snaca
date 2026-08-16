import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from '@/features/language/LanguageProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { MenuProvider } from '@/store/MenuProvider'
import { AppErrorBoundary } from './AppErrorBoundary'
import { AppRoutes } from './routes'
import { ScrollToTop } from './ScrollToTop'

/** GitHub Pages serves the app from `/<repo>/`, so routing lives under it. */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export function App() {
  return (
    <AppErrorBoundary>
      {/*
        Theme sits outside the menu: it must be right before any data loads,
        so the splash screen and the error panel are themed too.
      */}
      <ThemeProvider>
        <MenuProvider>
          <LanguageProvider>
            <BrowserRouter basename={basename}>
              <ScrollToTop />
              <AppRoutes />
            </BrowserRouter>
          </LanguageProvider>
        </MenuProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}
