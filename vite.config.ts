import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  return {
    plugins: [react()],
    // host: true exposes the dev server on your local network so you can open it on your phone.
    // `npm run dev:https` uses the self-signed cert in .certs/ (phones only allow the mic over https).
    server: {
      host: true,
      https:
        process.env.DEV_HTTPS && existsSync('.certs/cert.pem')
          ? { cert: readFileSync('.certs/cert.pem'), key: readFileSync('.certs/key.pem') }
          : undefined,
    },
  }
})
