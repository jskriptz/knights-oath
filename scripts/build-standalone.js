#!/usr/bin/env node
// Build a standalone single-file HTML that embeds one campaign's JSON data
// Usage: node scripts/build-standalone.js [campaignId] [outputFile]
// Example: node scripts/build-standalone.js knights-oath dist/knights-oath.html

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const campaignId = process.argv[2] || 'knights-oath';
const outputFile = process.argv[3] || `dist/${campaignId}.html`;
const rootDir = path.resolve(__dirname, '..');
const campaignDir = path.join(rootDir, 'campaigns', campaignId);

// Generate build hash for cache busting (short hash of timestamp + random)
const buildHash = crypto.createHash('md5')
  .update(Date.now().toString() + Math.random().toString())
  .digest('hex')
  .substring(0, 8);
const buildTimestamp = new Date().toISOString();

// Verify campaign exists
if (!fs.existsSync(campaignDir)) {
  console.error(`Campaign not found: ${campaignDir}`);
  process.exit(1);
}

// Read engine
let html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Read campaign manifest
const manifest = JSON.parse(fs.readFileSync(path.join(campaignDir, 'campaign.json'), 'utf8'));
const files = manifest.files || {};

// Read all campaign JSON files
const data = {};
for (const [key, filename] of Object.entries(files)) {
  const filePath = path.join(campaignDir, filename);
  if (fs.existsSync(filePath)) {
    data[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

// Build the inline data script that runs before the main script
const inlineScript = `
<script>
// Standalone build: ${manifest.title} (${manifest.id}) — embedded campaign data
// Build: ${buildHash} @ ${buildTimestamp}
window.__STANDALONE_CAMPAIGN__ = ${JSON.stringify(manifest)};
window.__STANDALONE_DATA__ = ${JSON.stringify(data)};
window.__BUILD_HASH__ = "${buildHash}";
window.__BUILD_TIME__ = "${buildTimestamp}";
</script>`;

// Add cache-busting meta tags to <head>
const cacheMeta = `
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="build-hash" content="${buildHash}">
  <meta name="build-time" content="${buildTimestamp}">`;
html = html.replace('</head>', cacheMeta + '\n</head>');

// Inject before the first <script> tag in the body
html = html.replace(/<script>/, inlineScript + '\n<script>');

// Ensure output directory exists
const outDir = path.dirname(path.resolve(rootDir, outputFile));
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Write
const outPath = path.resolve(rootDir, outputFile);
fs.writeFileSync(outPath, html);

// Update service worker cache version for cache busting
const swPath = path.join(rootDir, 'sw.js');
if (fs.existsSync(swPath)) {
  let sw = fs.readFileSync(swPath, 'utf8');
  // Update CACHE_NAME with new version
  const newCacheName = `knights-oath-${manifest.version}-${buildHash}`;
  sw = sw.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = '${newCacheName}';`);
  fs.writeFileSync(swPath, sw);
}

const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
console.log(`Built: ${outPath} (${sizeKB}KB)`);
console.log(`Campaign: ${manifest.title} v${manifest.version}`);
console.log(`Scenes: ${data.scenes ? Object.keys(data.scenes).length : '?'} + ${data.scenesDeferred ? Object.keys(data.scenesDeferred).length : '?'} deferred`);
console.log(`Build: ${buildHash}`);
