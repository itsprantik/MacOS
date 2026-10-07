import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwndcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwndcss()],
})