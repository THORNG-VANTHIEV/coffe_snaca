import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * `base` must match the GitHub repository name so that GitHub Pages serves
 * assets from `/<repo>/` (spec §52). Override it at build time when the site
 * lives somewhere else, e.g. a custom domain:
 *
 *   VITE_BASE=/ npm run build
 *
 * The deploy workflow sets VITE_BASE from the repository name, so this default
 * only shapes local `dev` and `preview` — keep it matching the repo so what
 * you see locally is what ships.
 */
const base = process.env.VITE_BASE ?? '/coffe_snaca/'

/**
 * GitHub Pages has no SPA rewrite, so refreshing `/coffee-menu/menu/latte`
 * would 404. It does serve `404.html` for unknown paths, so that file bounces
 * the request back to the app as `/?/menu/latte`, and a matching snippet in
 * index.html rewrites the address bar before React Router reads it.
 *
 * The number of path segments to preserve is derived from `base`, so a root
 * deployment keeps working without editing anything by hand.
 */
function githubPagesSpaFallback(basePath: string): Plugin {
  const segmentsToKeep = basePath.split('/').filter(Boolean).length

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>Redirecting…</title>
    <script>
      (function () {
        var segments = ${segmentsToKeep};
        var l = window.location;
        l.replace(
          l.protocol + '//' + l.host +
          l.pathname.split('/').slice(0, 1 + segments).join('/') + '/?/' +
          l.pathname.slice(1).split('/').slice(segments).join('/').replace(/&/g, '~and~') +
          (l.search ? '&' + l.search.slice(1) : '') +
          l.hash
        );
      })();
    </script>
  </head>
  <body></body>
</html>
`

  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '404.html', source: html })
    },
  }
}

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), githubPagesSpaFallback(base)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
  },
})
