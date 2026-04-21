import { cpSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const source = join(root, 'packages', 'web', 'out');
const dest = join(root, 'packages', 'server', 'dist', 'public');

if (!existsSync(source)) {
  console.error('Error: packages/web/out/ not found. Run web build first.');
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(source, dest, { recursive: true });
console.log(`Copied static files: ${source} → ${dest}`);
