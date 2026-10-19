import { cpSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
const backendConfig = path.join(root, '..', 'backend', 'config');
const environment = (process.env.APP_ENV || 'prod').trim().toLowerCase();
if (!['dev', 'prod'].includes(environment)) throw new Error('APP_ENV must be "dev" or "prod".');
const baseProperties = JSON.parse(readFileSync(path.join(backendConfig, 'properties.json'), 'utf8'));
const environmentProperties = JSON.parse(readFileSync(path.join(backendConfig, `properties.${environment}.json`), 'utf8'));
const apiBase = `${environmentProperties.backend.publicUrl.replace(/\/+$/, '')}${baseProperties.api.prefix}`;
mkdirSync(output, { recursive: true });
for (const directory of ['assets', 'en', 'es', 'de']) {
  cpSync(path.join(root, directory), path.join(output, directory), { recursive: true, force: true });
}
for (const file of ['index.html', 'robots.txt', 'sitemap.xml']) {
  copyFileSync(path.join(root, file), path.join(output, file));
}
writeFileSync(path.join(output, 'assets', 'config.js'), `window.LEILA_API_BASE = ${JSON.stringify(apiBase)};\nwindow.LEILA_PRICES = ${JSON.stringify(baseProperties.booking.prices)};\nwindow.LEILA_HALF_CHARTER = ${JSON.stringify(baseProperties.booking.halfCharter)};\n`);
process.stdout.write(`Frontend built into dist/ for ${environment}.\n`);
