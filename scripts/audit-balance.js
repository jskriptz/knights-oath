#!/usr/bin/env node
/**
 * Balance Audit Script — Points tallies, honour economy
 * Run: node scripts/audit-balance.js
 */

const fs = require('fs');
const path = require('path');

const MODULE_DIR = path.join(__dirname, '..', 'modules', 'knights-oath');

const scenes = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'scenes.json')));
const scenesDeferred = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'scenes-deferred.json')));
const rules = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'rules.json')));

const ALL_SCENES = { ...scenes, ...scenesDeferred };

const errors = [];
const warnings = [];

const stats = {
  honour: { gains: 0, losses: 0, gainScenes: [], lossScenes: [] },
  rose: { gains: 0, losses: 0 },
  sword: { gains: 0, losses: 0 },
  crown: { gains: 0, losses: 0 },
  extremePoints: [],
  hollowOutcomes: []
};

console.log('=== BALANCE AUDIT ===\n');

// 1. Scan all scenes for point awards
console.log('1. Scanning for point distributions...');
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (!choice.points) continue;

    for (const [type, delta] of Object.entries(choice.points)) {
      const typeLower = type.toLowerCase();

      if (typeLower === 'honour') {
        if (delta > 0) {
          stats.honour.gains += delta;
          stats.honour.gainScenes.push({ scene: id, letter: choice.letter, delta });
        } else if (delta < 0) {
          stats.honour.losses += Math.abs(delta);
          stats.honour.lossScenes.push({ scene: id, letter: choice.letter, delta });
        }
      } else if (typeLower === 'rose') {
        if (delta > 0) stats.rose.gains += delta;
        else stats.rose.losses += Math.abs(delta);
      } else if (typeLower === 'sword') {
        if (delta > 0) stats.sword.gains += delta;
        else stats.sword.losses += Math.abs(delta);
      } else if (typeLower === 'crown') {
        if (delta > 0) stats.crown.gains += delta;
        else stats.crown.losses += Math.abs(delta);
      }

      // Check for extreme values
      if (Math.abs(delta) > 3) {
        stats.extremePoints.push({ scene: id, letter: choice.letter, type, delta });
        warnings.push(`[EXTREME] Scene "${id}" [${choice.letter}] ${type} ${delta > 0 ? '+' : ''}${delta}`);
      }
    }
  }
}

// 2. Check for hollow outcomes in roll boxes
console.log('2. Scanning for hollow roll outcomes...');
const HOLLOW_PATTERNS = [
  /^\+\d+\s+(Honour|honour)\.?$/,
  /^Nothing more\.?$/i,
  /^You (notice|spot|see) nothing\.?$/i,
  /^The.*reveals nothing\.?$/i,
  /^No effect\.?$/i
];

for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.boxes) continue;
  for (const box of scene.boxes) {
    if (box.type !== 'roll') continue;
    const text = box.text || '';

    // Check success/failure outcomes
    const successMatch = text.match(/SUCCESS[^]*?(?=FAILURE|$)/i);
    const failureMatch = text.match(/FAILURE[^]*$/i);

    for (const outcome of [successMatch, failureMatch]) {
      if (!outcome) continue;
      const outcomeText = outcome[0];
      for (const pattern of HOLLOW_PATTERNS) {
        if (pattern.test(outcomeText.trim())) {
          stats.hollowOutcomes.push({ scene: id, pattern: pattern.source, text: outcomeText.substring(0, 50) });
          warnings.push(`[HOLLOW] Scene "${id}" has shallow roll outcome`);
        }
      }
    }
  }
}

// 3. Check approval balance
console.log('3. Checking approval extremes...');
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (!choice.approval) continue;
    for (const [comp, delta] of Object.entries(choice.approval)) {
      if (Math.abs(delta) > 3) {
        warnings.push(`[APPROVAL] Scene "${id}" [${choice.letter}] extreme approval (${delta}) for "${comp}"`);
      }
    }
  }
}

// 4. Check honour thresholds
console.log('4. Analyzing honour economy...');
const thresholds = rules.honourThresholds || {};
const maxPossibleHonour = 5 + stats.honour.gains; // Start with 5
const minPossibleHonour = 5 - stats.honour.losses;

console.log(`\n  Starting honour: 5`);
console.log(`  Max potential gains: +${stats.honour.gains} (${stats.honour.gainScenes.length} opportunities)`);
console.log(`  Max potential losses: -${stats.honour.losses} (${stats.honour.lossScenes.length} opportunities)`);
console.log(`  Theoretical range: ${minPossibleHonour} to ${maxPossibleHonour}`);

if (stats.honour.losses === 0) {
  errors.push('[BALANCE] No honour loss opportunities found — honour only goes up');
}

const gainLossRatio = stats.honour.gains / Math.max(1, stats.honour.losses);
if (gainLossRatio > 3) {
  warnings.push(`[BALANCE] Honour gain/loss ratio very high (${gainLossRatio.toFixed(1)}:1) — consider more loss opportunities`);
} else if (stats.honour.gains === 0) {
  // Only warn if there are NO honour gains at all
  warnings.push(`[BALANCE] No honour gain opportunities — consider adding some`);
}

// 5. Order point distribution
console.log('5. Checking order point distribution...');
const orderTotal = {
  rose: stats.rose.gains - stats.rose.losses,
  sword: stats.sword.gains - stats.sword.losses,
  crown: stats.crown.gains - stats.crown.losses
};

const avgOrder = (orderTotal.rose + orderTotal.sword + orderTotal.crown) / 3;
for (const [order, net] of Object.entries(orderTotal)) {
  // Only warn about severe imbalances (< 30% or > 200% of average)
  if (net < avgOrder * 0.3) {
    warnings.push(`[ORDER] ${order.toUpperCase()} severely underrepresented (${net} vs avg ${avgOrder.toFixed(1)})`);
  }
  if (net > avgOrder * 2) {
    warnings.push(`[ORDER] ${order.toUpperCase()} severely overrepresented (${net} vs avg ${avgOrder.toFixed(1)})`);
  }
}

// Summary
console.log('\n=== POINT SUMMARY ===');
console.log(`  HONOUR: +${stats.honour.gains} / -${stats.honour.losses} (ratio: ${gainLossRatio.toFixed(1)}:1)`);
console.log(`  ROSE:   +${stats.rose.gains} / -${stats.rose.losses} (net: ${orderTotal.rose})`);
console.log(`  SWORD:  +${stats.sword.gains} / -${stats.sword.losses} (net: ${orderTotal.sword})`);
console.log(`  CROWN:  +${stats.crown.gains} / -${stats.crown.losses} (net: ${orderTotal.crown})`);

if (stats.extremePoints.length > 0) {
  console.log(`\n  Extreme point awards: ${stats.extremePoints.length}`);
}

if (stats.hollowOutcomes.length > 0) {
  console.log(`  Hollow roll outcomes: ${stats.hollowOutcomes.length}`);
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

// Detailed listings
if (process.argv.includes('--detail')) {
  console.log('\n--- HONOUR GAIN SCENES ---');
  stats.honour.gainScenes.forEach(s => console.log(`  ${s.scene} [${s.letter}]: +${s.delta}`));
  console.log('\n--- HONOUR LOSS SCENES ---');
  stats.honour.lossScenes.forEach(s => console.log(`  ${s.scene} [${s.letter}]: ${s.delta}`));
}

process.exit(errors.length > 0 ? 1 : 0);
