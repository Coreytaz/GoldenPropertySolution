import { readFile, access } from 'node:fs/promises'
import { join, resolve } from 'node:path'
const dist = resolve(import.meta.dirname, '../dist')
const html = await readFile(join(dist, 'index.html'), 'utf8')
const css = await readFile(join(dist, 'css/style.css'), 'utf8')
const js = await readFile(join(dist, 'js/app.js'), 'utf8')
const images = [...html.matchAll(/(?:src|href|srcset)="(images\/[^"#]+)"/g)].map(m => m[1])
const resources = [...html.matchAll(/(?:src|href)="((?:css|js)\/[^"#]+)"/g)].map(m => m[1])
for (const resource of [...images, ...resources]) await access(join(dist, resource))
for (const match of css.matchAll(/url\(['"]?\.\.\/(images\/[^'"\)]+)['"]?\)/g)) await access(join(dist, match[1]))
const count = pattern => [...html.matchAll(pattern)].length
if (count(/<h1(?:\s|>)/g) !== 1 || count(/<main(?:\s|>)/g) !== 1) throw new Error('Нарушена семантика: нужен один main и h1')
if (count(/<form(?:\s|>)/g) !== count(/<form[^>]+data-lead-form/g)) throw new Error('Форма не имеет JS-хука')
if (count(/<input\b/g) !== count(/<input[^>]*\brequired\b/g)) throw new Error('Поля без required')
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))
for (const anchor of [...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1])) if (!ids.has(anchor)) throw new Error('Якорь без адресата: #' + anchor)
for (const resource of [html, css, js]) if (resource.includes('@@include')) throw new Error('Неразрешённый HTML include')
console.log(`Проверка пройдена: h1=1, main=1, формы=${count(/<form(?:\s|>)/g)}, изображения=${images.length}, якорные ссылки валидны`)
