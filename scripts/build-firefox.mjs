import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, BROWSER_TARGET: 'firefox' }
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
      }
    });
  });
}

await run('vite', ['build', '--outDir', 'dist-firefox']);

const firefoxManifestPath = resolve(process.cwd(), 'dist-firefox', 'manifest.json');
const manifest = JSON.parse(await readFile(firefoxManifestPath, 'utf8'));

if (Array.isArray(manifest.web_accessible_resources)) {
  manifest.web_accessible_resources = manifest.web_accessible_resources.map((resource) => {
    const { use_dynamic_url, ...rest } = resource;
    return rest;
  });
}

if (manifest.background?.service_worker) {
  throw new Error('Invalid Firefox build: background.service_worker is present in dist-firefox/manifest.json');
}

if (!Array.isArray(manifest.background?.scripts) || manifest.background.scripts.length === 0) {
  throw new Error('Invalid Firefox build: background.scripts is missing in dist-firefox/manifest.json');
}

await writeFile(firefoxManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log('Firefox build ready in dist-firefox');
