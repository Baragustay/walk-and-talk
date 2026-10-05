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
          const url = `http://${req.headers.host}/.netlify/functions/${name}`
          const request = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
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

export default defineConfig(({ mode }) => {
  // Make .env values (like GEMINI_API_KEY) visible to functions in dev. Server side only.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), netlifyFunctionsDev()],
    // host: true exposes the dev server on your local network so you can open it on your phone.
    server: { host: true },
  }
})
