#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function printHelp() {
  console.log(`
Everforest Userstyle Converter
Convert any Catppuccin userstyle LESS file into an Everforest userstyle.

Usage:
  node converter.mjs <input-file-or-url> [options]

Options:
  --out, -o <file>     Destination file path (defaults to <input>.everforest.user.less)
  --cdn <url>          Import Everforest library from a CDN instead of inlining
  --inline             Inline Everforest library directly into the file (default)
  --name <title>       Override theme name in UserStyle header
  --help, -h           Show this help message

Examples:
  node converter.mjs styles/github/catppuccin.user.less -o styles/github/everforest.user.less
  node converter.mjs https://raw.githubusercontent.com/catppuccin/userstyles/main/styles/youtube/catppuccin.user.less
`);
}

async function loadContent(input) {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const res = await fetch(input);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${input}: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  }
  return readFileSync(resolve(process.cwd(), input), 'utf8');
}

function convertToEverforest(source, options = {}) {
  let output = source;

  // 1. Update metadata name & author
  if (options.name) {
    output = output.replace(/@name\s+[^\r\n]+/g, `@name ${options.name}`);
  } else {
    output = output.replace(/@name\s+(?:GitHub\s+)?Catppuccin([^\r\n]*)/gi, (match, suffix) => {
      return `@name ${match.replace(/catppuccin/gi, 'Everforest').replace('@name ', '')}`;
    });
  }

  output = output.replace(
    /@description\s+[^\r\n]+/g,
    '@description Comfortable natural green-based theme'
  );
  output = output.replace(/@author\s+[^\r\n]+/g, '@author Everforest Port');

  // 2. Replace dropdown variables
  output = output.replace(
    /@var\s+select\s+lightFlavor[^\r\n]+/g,
    '@var select lightFlavor "Light Contrast" ["light_medium:Medium*", "light_hard:Hard", "light_soft:Soft"]'
  );
  output = output.replace(
    /@var\s+select\s+darkFlavor[^\r\n]+/g,
    '@var select darkFlavor "Dark Contrast" ["dark_medium:Medium*", "dark_hard:Hard", "dark_soft:Soft"]'
  );
  output = output.replace(
    /@var\s+select\s+accentColor[^\r\n]+/g,
    '@var select accentColor "Accent" ["green:Green*", "aqua:Aqua", "blue:Blue", "purple:Purple", "yellow:Yellow", "orange:Orange", "red:Red"]'
  );

  // 3. Replace @import with Everforest library
  const libPath = resolve(__dirname, '../lib/everforest.less');
  const libContent = readFileSync(libPath, 'utf8').trim();

  const importRegex = /@import\s+["']https:\/\/userstyles\.catppuccin\.com\/lib\/std\/v1\.less["'];?/g;

  if (options.cdn) {
    output = output.replace(importRegex, `@import "${options.cdn}";`);
  } else {
    output = output.replace(importRegex, `/* === Everforest Library === */\n${libContent}\n/* ============================ */`);
  }

  // 4. Update flavor conditions for latte/light
  output = output.replace(/&\s*when\s*\(\s*@flavor\s*=\s*latte\s*\)/g, '& when (@isLight = true)');
  output = output.replace(/&\s*when\s+not\s*\(\s*@flavor\s*=\s*latte\s*\)/g, '& when not(@isLight = true)');

  // 5. Update mixin names: #catppuccin -> #everforest
  output = output.replace(/#catppuccin\(/g, '#everforest(');

  // 6. Remove Catppuccin asset replacements like loading gifs
  output = output.replace(
    /img\[src="https:\/\/github\.githubassets\.com\/assets\/mona-loading-default-c3c7aad1282f\.gif"\]\s*\{[^}]+\}/g,
    '/* loading gif replacement omitted for Everforest */'
  );

  return output;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const input = args[0];
  let outPath = null;
  let cdn = null;
  let name = null;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--out' || args[i] === '-o') {
      outPath = args[++i];
    } else if (args[i] === '--cdn') {
      cdn = args[++i];
    } else if (args[i] === '--name') {
      name = args[++i];
    }
  }

  if (!outPath) {
    const defaultBase = input.startsWith('http') ? input.split('/').pop() : input;
    outPath = defaultBase.replace(/\.catppuccin/g, '').replace(/\.user\.less$/, '') + '.everforest.user.less';
  }

  console.log(`Reading source from: ${input}`);
  const content = await loadContent(input);

  console.log(`Converting to Everforest...`);
  const converted = convertToEverforest(content, { cdn, name });

  const resolvedOut = resolve(process.cwd(), outPath);
  mkdirSync(dirname(resolvedOut), { recursive: true });
  writeFileSync(resolvedOut, converted, 'utf8');
  console.log(`Successfully generated: ${resolvedOut}`);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
