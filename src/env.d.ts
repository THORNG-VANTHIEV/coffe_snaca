/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Overrides where the menu document is fetched from. Leave unset in
   * production — it then reads the static `public/data/db.json`.
   *
   * Local json-server:  VITE_MENU_URL=http://localhost:3001/db
   * Future REST API:    VITE_MENU_URL=https://api.example.com/menu
   */
  readonly VITE_MENU_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
