import { cpSync, copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
mkdirSync(output, { recursive: true });
for (const directory of ['assets', 'en', 'es', 'de']) {
  cpSync(path.join(root, directory), path.join(output, directory), { recursive: true, force: true });
}
for (const file of ['index.html', 'robots.txt', 'sitemap.xml']) {
  copyFileSync(path.join(root, file), path.join(output, file));
}
process.stdout.write('Frontend built into dist/.\n');
