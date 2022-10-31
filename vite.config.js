import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: false },
  plugins: [
    vue(),
    mkcert()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        court_manage: resolve(__dirname, 'pages/court_manage.html'),
        setting_users: resolve(__dirname, 'pages/setting_users.html'),
        setting_date: resolve(__dirname, 'pages/setting_date.html'),
        setting_date_detail: resolve(__dirname, 'pages/setting_date_detail.html')
      }
    }
  }
})
