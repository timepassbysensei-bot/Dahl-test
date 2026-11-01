import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only host allowlist for hosted previews (comma separated).
// Example: DEV_ALLOWED_HOSTS=preview.example.dev npm run dev
// Exact hosts only — never a wildcard. Production builds are unaffected.
const devAllowedHosts = (process.env.DEV_ALLOWED_HOSTS || '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

// Vite configuration tuned for a static Netlify deploy.
// The dev server binds to 0.0.0.0 so it can be previewed from a hosted workspace.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    ...(devAllowedHosts.length > 0 ? { allowedHosts: devAllowedHosts } : {}),
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2019',
    chunkSizeWarningLimit: 900,
  },
})
