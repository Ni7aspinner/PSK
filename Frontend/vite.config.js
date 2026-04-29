import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function loadPropertiesFile(filePath) {
  const contents = fs.readFileSync(filePath, 'utf8')

  return contents.split(/\r?\n/).reduce((config, line) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      return config
    }

    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) {
      return config
    }

    const key = trimmed.slice(0, equalsIndex).trim()
    const value = trimmed.slice(equalsIndex + 1).trim()

    if (key) {
      config[key] = value
    }

    return config
  }, {})
}

const propertiesPath = path.resolve(process.cwd(), 'environment.properties')
const environmentSettings = loadPropertiesFile(propertiesPath)
const backendUrl = environmentSettings.BACKEND_URL

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
  },
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        rewrite: (requestPath) => requestPath.replace(new RegExp(`^/api`), ''),
      },
    },
  },
})
