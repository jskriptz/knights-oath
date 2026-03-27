#!/usr/bin/env node
// Build a standalone single-file HTML that embeds one campaign's JSON data
// Usage: node scripts/build-standalone.js [campaignId] [outputFile]
// Example: node scripts/build-standalone.js knights-oath dist/knights-oath.html

const fs = require('fs');
const path = require('path');

const campaignId = process.argv[2] || 'knights-oath';
const outputFile = process.argv[3] || `dist/${campaignId}.html`;
const rootDir = path.resolve(__dirname, '..');
const campaignDir = path.join(rootDir, 'campaigns', campaignId);

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
window.__STANDALONE_CAMPAIGN__ = ${JSON.stringify(manifest)};
window.__STANDALONE_DATA__ = ${JSON.stringify(data)};
</script>`;

// Inject before the first <script> tag in the body
html = html.replace(/<script>/, inlineScript + '\n<script>');

// Ensure output directory exists
const outDir = path.dirname(path.resolve(rootDir, outputFile));
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Write
const outPath = path.resolve(rootDir, outputFile);
fs.writeFileSync(outPath, html);

const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
console.log(`Built: ${outPath} (${sizeKB}KB)`);
console.log(`Campaign: ${manifest.title} v${manifest.version}`);
console.log(`Scenes: ${data.scenes ? Object.keys(data.scenes).length : '?'} + ${data.scenesDeferred ? Object.keys(data.scenesDeferred).length : '?'} deferred`);
