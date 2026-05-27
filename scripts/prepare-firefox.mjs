import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const chromeManifestPath = resolve(root, 'manifest.json');
const manifestPath = resolve(root, 'manifest.firefox.json');

const chromeManifest = JSON.parse(await readFile(chromeManifestPath, 'utf8'));
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

if (manifest.version !== chromeManifest.version) {
  manifest.version = chromeManifest.version;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Updated manifest.firefox.json version to ${chromeManifest.version}`);
} else {
  console.log('manifest.firefox.json already matches manifest.json version');
}
