import { spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFile, watch } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const dist = join(root, 'dist')
function build() {
  const result = spawnSync(process.execPath, [join(root, 'scripts/build.mjs')], { stdio: 'inherit' })
  if (result.status !== 0) console.error('Ошибка сборки')
}
build()
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' }
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const path = resolve(dist, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '')
    if (!path.startsWith(dist + sep)) { res.writeHead(403).end(); return }
    const data = await readFile(path)
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }).end(data)
  } catch { res.writeHead(404).end('Not found') }
}).listen(3000, '127.0.0.1', () => console.log('Сайт доступен по адресу http://localhost:3000'))
const watcher = watch(join(root, 'src'), { recursive: true })
for await (const event of watcher) {
  if (event.filename) build()
}
