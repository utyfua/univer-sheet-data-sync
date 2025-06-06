import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  resolve: {
    mainFields: [],
    alias: [
      { find: 'univer-sheet-data-sync', replacement: path.resolve(__dirname, 'src') },
    ]
  },
})