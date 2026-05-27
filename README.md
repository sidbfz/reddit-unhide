# Unhider for Reddit

**Install the extension:**
- 🥇 [Available on the Chrome Web Store](https://chromewebstore.google.com/detail/unhider-for-reddit/ikcadejmgkijfldlndckdbmkkaimlmel)
- 🦊 [Available on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reddit-unhider/)

Source code repository for the Unhider for Reddit browser extension.

## Purpose

Unhider for Reddit restores deleted or hidden Reddit profile and post content by querying supported archive endpoints and rendering recovered content in the Reddit UI.

## Build Environment

- Operating system: Windows 10/11, macOS, or Linux
- Node.js: 20.x or newer (tested with Node 22)
- npm: 10.x or newer

## Install Dependencies

From the project root:

```bash
npm install
```

## Project Scripts

- `npm run build`: Build Chrome-target output into `dist`
- `npm run build:chrome`: Alias of `npm run build`
- `npm run build:firefox`: Build Firefox-target output into `dist-firefox`
- `npm run package:firefox`: Build Firefox output and create AMO upload zip in `web-ext-artifacts`
- `npm run run:firefox`: Run the Firefox build with `web-ext` for local desktop testing

## Exact Firefox Add-on Reproduction Steps

These steps recreate the exact Firefox add-on package from source.

1. Install dependencies:

```bash
npm install
```

2. Build Firefox output:

```bash
npm run build:firefox
```

3. Package Firefox artifact:

```bash
npm run package:firefox
```

4. Upload the produced zip from:

- `web-ext-artifacts/unhider_for_reddit-<version>.zip`

## Exact Chrome Build Reproduction Steps

1. Install dependencies:

```bash
npm install
```

2. Build Chrome output:

```bash
npm run build:chrome
```

3. Use generated extension files from:

- `dist/`

## Notes About Source Submission

For Mozilla AMO reviewers requiring source code, please include the following files and folders in the source archive:
- `src/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`
- `manifest.json`
- `manifest.firefox.json`
- `README.md`

Do NOT include `node_modules/`, `dist/`, `dist-firefox/`, `web-ext-artifacts/`, or any `.zip` files in the source archive.

- Build outputs in `dist/` and `dist-firefox/` are generated artifacts.
- `node_modules/` contains third-party libraries and is not source authored for this project.

## Main Files

- `manifest.json`: Chrome-target extension manifest
- `manifest.firefox.json`: Firefox-target extension manifest
- `vite.config.ts`: Vite + CRXJS build config with browser target selection
- `scripts/prepare-firefox.mjs`: Synchronizes Firefox manifest version with `manifest.json`
- `scripts/build-firefox.mjs`: Firefox build and manifest post-processing
