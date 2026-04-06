#!/usr/bin/env node
/**
 * Companion Audit Script — Name consistency and approval validation
 * Run: node scripts/audit-companions.js
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGN_DIR = path.join(__dirname, '..', 'campaigns', 'knights-oath');

const scenes = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scenes.json')));
const scenesDeferred = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scenes-deferred.json')));
const rules = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'rules.json')));
const companions = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'companions.json')));
const sceneEffects = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scene-effects.json')));

const ALL_SCENES = { ...scenes, ...scenesDeferred };
const COMPANIONS_ALL = companions.all;
const COMPANION_DATA = companions.data;

const errors = [];
const warnings = [];
const stats = {
  approvalMentions: {},
  romanceMentions: {},
  totalApprovalChanges: {}
};

// Initialize stats
COMPANIONS_ALL.forEach(c => {
  stats.approvalMentions[c] = 0;
  stats.romanceMentions[c] = 0;
  stats.totalApprovalChanges[c] = { positive: 0, negative: 0 };
});

console.log('=== COMPANION AUDIT ===\n');
console.log(`Total companions: ${COMPANIONS_ALL.length}`);
console.log(`Companions: ${COMPANIONS_ALL.join(', ')}\n`);

// 1. Check companion data completeness
console.log('1. Checking companion data completeness...');
for (const name of COMPANIONS_ALL) {
  const data = COMPANION_DATA[name];
  if (!data) {
    errors.push(`[DATA] Companion "${name}" in 'all' but missing from 'data'`);
    continue;
  }
  if (!data.portrait) warnings.push(`[DATA] Companion "${name}" missing portrait`);
  if (!data.desc) warnings.push(`[DATA] Companion "${name}" missing description`);
  if (!data.personality) warnings.push(`[DATA] Companion "${name}" missing personality`);
  if (!data.romance) warnings.push(`[DATA] Companion "${name}" missing romance info`);
}

// 2. Check combat stats
console.log('2. Checking combat stats...');
const combatStats = companions.combatStats || {};
const combatStatKeys = new Set(Object.keys(combatStats));
for (const name of COMPANIONS_ALL) {
  // Try multiple name formats: first name, last name, any word in the name
  const nameParts = name.split(' ');
  const hasStats = nameParts.some(part => combatStatKeys.has(part));
  if (!hasStats) {
    errors.push(`[COMBAT] Companion "${name}" missing combat stats (tried: ${nameParts.join(', ')})`);
  }
}

// 3. Scan all scenes for companion references
console.log('3. Scanning scenes for companion references...');
const companionNamePatterns = COMPANIONS_ALL.map(c => ({
  name: c,
  firstName: c.split(' ')[0],
  lastName: c.split(' ').slice(1).join(' ')
}));

for (const [id, scene] of Object.entries(ALL_SCENES)) {
  // Check approval in choices
  if (scene.choices) {
    for (const choice of scene.choices) {
      if (choice.approval) {
        for (const [comp, delta] of Object.entries(choice.approval)) {
          if (!COMPANIONS_ALL.includes(comp)) {
            errors.push(`[APPROVAL] Scene "${id}" [${choice.letter}] invalid companion: "${comp}"`);
          } else {
            stats.approvalMentions[comp]++;
            if (delta > 0) stats.totalApprovalChanges[comp].positive += delta;
            else stats.totalApprovalChanges[comp].negative += Math.abs(delta);
          }
          // Check for extreme values
          if (Math.abs(delta) > 3) {
            warnings.push(`[APPROVAL] Scene "${id}" [${choice.letter}] extreme delta (${delta}) for "${comp}"`);
          }
        }
      }
      // Check romance_comp
      if (choice.romance_comp) {
        if (!COMPANIONS_ALL.includes(choice.romance_comp)) {
          errors.push(`[ROMANCE] Scene "${id}" [${choice.letter}] invalid romance_comp: "${choice.romance_comp}"`);
        } else {
          stats.romanceMentions[choice.romance_comp]++;
        }
      }
    }
  }
}

// 4. Check scene effects
console.log('4. Checking scene effects...');
for (const [sceneId, effects] of Object.entries(sceneEffects)) {
  if (effects.always) {
    for (const ef of effects.always) {
      if (ef.comp && !COMPANIONS_ALL.some(c => c.toLowerCase() === ef.comp.toLowerCase())) {
        errors.push(`[EFFECTS] Scene "${sceneId}" references unknown companion: "${ef.comp}"`);
      }
    }
  }
}

// 5. Check travel events
console.log('5. Checking travel event companion requirements...');
for (const ev of (rules.travelEvents || [])) {
  if (ev.requireCompanion && !COMPANIONS_ALL.includes(ev.requireCompanion)) {
    errors.push(`[TRAVEL] Event "${ev.id}" requires unknown companion: "${ev.requireCompanion}"`);
  }
  if (ev.requireRomance?.companion && !COMPANIONS_ALL.includes(ev.requireRomance.companion)) {
    errors.push(`[TRAVEL] Event "${ev.id}" requireRomance unknown companion: "${ev.requireRomance.companion}"`);
  }
}

// 6. Check approval deltas (rules.json) - array format with short names
console.log('6. Checking approvalDeltas in rules...');
// Build list of valid short names (any part of full name)
const validShortNames = new Set();
for (const name of COMPANIONS_ALL) {
  validShortNames.add(name); // Full name
  for (const part of name.split(' ')) {
    validShortNames.add(part); // Each word
  }
}
const approvalDeltas = rules.approvalDeltas || [];
if (Array.isArray(approvalDeltas)) {
  for (const entry of approvalDeltas) {
    if (!entry.scene || !entry.deltas) continue;
    for (const comp of Object.keys(entry.deltas)) {
      if (!validShortNames.has(comp)) {
        errors.push(`[RULES] approvalDeltas scene "${entry.scene}" [${entry.letter}] unknown companion: "${comp}"`);
      }
    }
  }
}

// Summary
console.log('\n=== COMPANION STATS ===');
console.log('\nApproval mentions by companion:');
for (const [name, count] of Object.entries(stats.approvalMentions).sort((a,b) => b[1] - a[1])) {
  const changes = stats.totalApprovalChanges[name];
  console.log(`  ${name}: ${count} mentions (+${changes.positive}/-${changes.negative})`);
}

console.log('\nRomance scene mentions:');
for (const [name, count] of Object.entries(stats.romanceMentions).sort((a,b) => b[1] - a[1])) {
  if (count > 0) console.log(`  ${name}: ${count} romance scenes`);
}

// Check for underrepresented companions
const avgMentions = Object.values(stats.approvalMentions).reduce((a,b) => a+b, 0) / COMPANIONS_ALL.length;
for (const [name, count] of Object.entries(stats.approvalMentions)) {
  if (count < avgMentions * 0.5) {
    warnings.push(`[BALANCE] Companion "${name}" underrepresented (${count} vs avg ${avgMentions.toFixed(1)})`);
  }
}

console.log('\n=== SUMMARY ===');
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n--- ERRORS ---');
  errors.forEach(e => console.log('  ' + e));
}

if (warnings.length > 0 && process.argv.includes('--warnings')) {
  console.log('\n--- WARNINGS ---');
  warnings.forEach(w => console.log('  ' + w));
}

process.exit(errors.length > 0 ? 1 : 0);
