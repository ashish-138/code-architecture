import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'src/app'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@config': path.resolve(__dirname, 'src/config'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@styles': path.resolve(__dirname, 'src/styles')
      }
    },
    define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version) },
    server: { port: 5173 },
    preview: { port: 4173 },
    envPrefix: 'VITE_'
})
