import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // allow external connections (needed in Docker)
    port: 8080       // match your docker-compose port mapping
  }
})
