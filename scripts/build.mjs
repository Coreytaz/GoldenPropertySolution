import { mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const src = join(root, 'src')
const out = join(root, 'dist')
const cssFiles = ['base', 'header', 'hero', 'benefits', 'type', 'stats', 'contact', 'footer']

async function copyTree(from, to) {
  await mkdir(to, { recursive: true })
  for (const item of await readdir(from, { withFileTypes: true })) {
    const a = join(from, item.name), b = join(to, item.name)
    if (item.isDirectory()) await copyTree(a, b)
    else if (item.isFile()) await copyFile(a, b)
  }
}
async function expandIncludes(input, depth = 0) {
  if (depth > 10) throw new Error('Слишком глубокая вложенность HTML include')
  const matches = [...input.matchAll(/@@include\(['"]([^'"]+)['"]\)/g)]
  for (const match of matches) {
    const file = resolve(src, match[1])
    const pathFromSrc = relative(src, file)
    if (!pathFromSrc || pathFromSrc === '..' || pathFromSrc.startsWith('..' + sep) || isAbsolute(pathFromSrc)) {
      throw new Error('Недопустимый путь include: ' + match[1])
    }
    const content = await expandIncludes(await readFile(file, 'utf8'), depth + 1)
    input = input.replace(match[0], content)
  }
  return input
}
await rm(out, { recursive: true, force: true })
await mkdir(join(out, 'css'), { recursive: true })
await mkdir(join(out, 'js'), { recursive: true })
await copyTree(join(src, 'images'), join(out, 'images'))
let html = await expandIncludes(await readFile(join(src, 'index.html'), 'utf8'))
if (html.includes('@@include')) throw new Error('Неразрешённый include')
await writeFile(join(out, 'index.html'), html)
const css = (await Promise.all(cssFiles.map(async name => `/* ${name}.css */\n` + await readFile(join(src, 'css', `${name}.css`), 'utf8')))).join('\n')
await writeFile(join(out, 'css', 'style.css'), css)
await copyFile(join(src, 'js', 'app.js'), join(out, 'js', 'app.js'))
console.log('Сборка завершена: dist/index.html, css/style.css, js/app.js, images/')
