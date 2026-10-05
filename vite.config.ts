import { existsSync, readFileSync } from 'node:fs'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Serves netlify/functions/*.ts during `npm run dev`, so we don't need the Netlify CLI locally.
function netlifyFunctionsDev(): Plugin {
  return {
    name: 'netlify-functions-dev',
    configureServer(server) {
      server.middlewares.use('/.netlify/functions/', async (req, res) => {
        const name = (req.url ?? '').split('?')[0].replace(/^\//, '')
        try {
          const mod = await server.ssrLoadModule(`/netlify/functions/${name}.ts`)
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const host = req.headers.host ?? req.headers[':authority']
          const url = `http://${host}/.netlify/functions/${name}`
          const request = new Request(url, {
            method: req.method,
            // Skip HTTP/2 pseudo-headers (":method" etc.), which Request doesn't accept.
            headers: Object.entries(req.headers).filter(
              (e): e is [string, string] => !e[0].startsWith(':') && typeof e[1] === 'string',
            ),
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
          })
          const response: Response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          console.error(err)
          res.statusCode = 404
          res.end(`No function "${name}"`)
        }
      })
    },
  }
}

// Writes dist/api/config.php so the Hostinger token endpoint knows the (public) Supabase values.
function phpConfig(): Plugin {
  return {
    name: 'php-config',
    apply: 'build',
    generateBundle() {
      const php = (v?: string) => `'${(v ?? '').replace(/[\\']/g, '')}'`
      this.emitFile({
        type: 'asset',
        fileName: 'api/config.php',
        source:
          `<?php // Generated at build time. Public values only.\n` +
          `return ['supabase_url' => ${php(process.env.VITE_SUPABASE_URL)}, 'supabase_anon_key' => ${php(process.env.VITE_SUPABASE_ANON_KEY)}];\n`,
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make .env values (like GEMINI_API_KEY) visible to functions in dev. Server side only.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), netlifyFunctionsDev(), phpConfig()],
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
