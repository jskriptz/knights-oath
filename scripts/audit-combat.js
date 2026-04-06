#!/usr/bin/env node
/**
 * Combat Audit Script — Narration and outcome coverage
 * Run: node scripts/audit-combat.js
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGN_DIR = path.join(__dirname, '..', 'campaigns', 'knights-oath');

const scenes = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scenes.json')));
const scenesDeferred = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scenes-deferred.json')));
const combatNarration = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'combat-narration.json')));
const combatOutcomes = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'combat-outcomes.json')));
const rules = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'rules.json')));

const ALL_SCENES = { ...scenes, ...scenesDeferred };

const errors = [];
const warnings = [];
const stats = {
  combatScenes: [],
  missingNarration: [],
  missingOutcomes: [],
  unusedNarration: [],
  unusedOutcomes: []
};

console.log('=== COMBAT AUDIT ===\n');

// 1. Find all scenes with combat boxes
console.log('1. Finding combat scenes...');
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.boxes) continue;
  for (const box of scene.boxes) {
    const text = box.text || '';
    if (text.includes('[COMBAT]') || box.type === 'combat') {
      stats.combatScenes.push(id);
      break;
    }
  }
}

console.log(`   Found ${stats.combatScenes.length} combat scenes`);

// 2. Check narration coverage
console.log('2. Checking narration coverage...');
const narrationScenes = new Set(Object.keys(combatNarration));
for (const sceneId of stats.combatScenes) {
  if (!narrationScenes.has(sceneId)) {
    stats.missingNarration.push(sceneId);
    errors.push(`[NARRATION] Combat scene "${sceneId}" missing narration`);
  }
}

// Check for unused narration
for (const sceneId of narrationScenes) {
  if (!stats.combatScenes.includes(sceneId)) {
    stats.unusedNarration.push(sceneId);
    warnings.push(`[NARRATION] Narration for "${sceneId}" but no combat in scene`);
  }
}

// 3. Check outcomes coverage
console.log('3. Checking outcomes coverage...');
const outcomeScenes = new Set(Object.keys(combatOutcomes));
for (const sceneId of stats.combatScenes) {
  if (!outcomeScenes.has(sceneId)) {
    stats.missingOutcomes.push(sceneId);
    errors.push(`[OUTCOMES] Combat scene "${sceneId}" missing outcomes`);
  }
}

// Check for unused outcomes
for (const sceneId of outcomeScenes) {
  if (!stats.combatScenes.includes(sceneId)) {
    stats.unusedOutcomes.push(sceneId);
    warnings.push(`[OUTCOMES] Outcomes for "${sceneId}" but no combat in scene`);
  }
}

// 4. Validate narration structure
console.log('4. Validating narration structure...');
for (const [sceneId, narration] of Object.entries(combatNarration)) {
  // Check for required fields
  if (!narration.intro && !narration.rounds) {
    warnings.push(`[NARRATION] Scene "${sceneId}" missing intro/rounds`);
  }
  // Check rounds have content
  if (narration.rounds) {
    for (let i = 0; i < narration.rounds.length; i++) {
      const round = narration.rounds[i];
      if (!round.situation && !round.playerTurn && !round.enemyTurn) {
        warnings.push(`[NARRATION] Scene "${sceneId}" round ${i + 1} is empty`);
      }
    }
  }
}

// 5. Validate outcomes structure
console.log('5. Validating outcomes structure...');
for (const [sceneId, outcomes] of Object.entries(combatOutcomes)) {
  if (!outcomes.victory && !outcomes.defeat) {
    warnings.push(`[OUTCOMES] Scene "${sceneId}" missing victory/defeat`);
  }
  // Check victory has prose
  if (outcomes.victory) {
    if (!outcomes.victory.prose && !outcomes.victory.text) {
      warnings.push(`[OUTCOMES] Scene "${sceneId}" victory missing prose`);
    }
  }
  // Check defeat has prose
  if (outcomes.defeat) {
    if (!outcomes.defeat.prose && !outcomes.defeat.text) {
      warnings.push(`[OUTCOMES] Scene "${sceneId}" defeat missing prose`);
    }
  }
}

// 6. Check special combat rules
console.log('6. Checking special combat rules...');
const specialCombat = rules.specialCombat || {};
if (specialCombat.boarFight) {
  for (const sceneId of specialCombat.boarFight) {
    if (!ALL_SCENES[sceneId]) {
      errors.push(`[SPECIAL] Boar fight scene "${sceneId}" not found`);
    }
  }
}
if (specialCombat.duel) {
  for (const sceneId of specialCombat.duel) {
    if (!ALL_SCENES[sceneId]) {
      errors.push(`[SPECIAL] Duel scene "${sceneId}" not found`);
    }
  }
}

// 7. Check noLootScenes
console.log('7. Checking noLootScenes...');
for (const sceneId of (rules.noLootScenes || [])) {
  if (!ALL_SCENES[sceneId]) {
    warnings.push(`[LOOT] noLootScenes "${sceneId}" not found`);
  }
}

// Summary
console.log('\n=== COMBAT COVERAGE ===');
console.log(`  Total combat scenes: ${stats.combatScenes.length}`);
console.log(`  With narration: ${stats.combatScenes.length - stats.missingNarration.length}`);
console.log(`  With outcomes: ${stats.combatScenes.length - stats.missingOutcomes.length}`);

if (stats.missingNarration.length > 0) {
  console.log(`\n  Missing narration (${stats.missingNarration.length}):`);
  stats.missingNarration.forEach(s => console.log(`    - ${s}`));
}

if (stats.missingOutcomes.length > 0) {
  console.log(`\n  Missing outcomes (${stats.missingOutcomes.length}):`);
  stats.missingOutcomes.forEach(s => console.log(`    - ${s}`));
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

// Full combat scene list
if (process.argv.includes('--list')) {
  console.log('\n--- ALL COMBAT SCENES ---');
  stats.combatScenes.forEach(s => {
    const hasNarr = narrationScenes.has(s) ? '✓' : '✗';
    const hasOut = outcomeScenes.has(s) ? '✓' : '✗';
    console.log(`  ${s}: narr[${hasNarr}] out[${hasOut}]`);
  });
}

process.exit(errors.length > 0 ? 1 : 0);
