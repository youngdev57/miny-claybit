import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const env = process.argv[2];
if (env !== 'dev' && env !== 'prd') {
  console.error('Usage: node scripts/tar.mjs <dev|prd>');
  process.exit(1);
}

const { name } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const filename = `${name}-dist-${env}.tar.gz`;

execSync(`tar -czf ${filename} dist`, { stdio: 'inherit' });
console.log(`Created ${filename}`);
