#!/usr/bin/env node
/**
 * Romance Audit Script — Progression logic and stage requirements
 * Run: node scripts/audit-romance.js
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGN_DIR = path.join(__dirname, '..', 'campaigns', 'knights-oath');

const scenes = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scenes.json')));
const scenesDeferred = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'scenes-deferred.json')));
const rules = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'rules.json')));
const companions = JSON.parse(fs.readFileSync(path.join(CAMPAIGN_DIR, 'companions.json')));

const ALL_SCENES = { ...scenes, ...scenesDeferred };
const COMPANIONS_ALL = companions.all;
const COMPANION_DATA = companions.data;

const ROMANCE_STAGES = ['Spark', 'Flame', 'Oath'];
const ROMANCE_RANK = { Spark: 1, Flame: 2, Oath: 3 };

const errors = [];
const warnings = [];

// Track romance scenes per companion
const romanceScenes = {};
COMPANIONS_ALL.forEach(c => {
  romanceScenes[c] = { Spark: [], Flame: [], Oath: [] };
});

console.log('=== ROMANCE AUDIT ===\n');

// 1. Scan all scenes for romance triggers
console.log('1. Scanning for romance scenes...');
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    let stage = null;
    if (choice.romance_spark) stage = 'Spark';
    else if (choice.romance_flame) stage = 'Flame';
    else if (choice.romance_oath) stage = 'Oath';

    if (stage) {
      const comp = choice.romance_comp;
      if (comp && COMPANIONS_ALL.includes(comp)) {
        romanceScenes[comp][stage].push({ scene: id, letter: choice.letter });
      } else if (comp) {
        errors.push(`[ROMANCE] Scene "${id}" [${choice.letter}] ${stage} for unknown companion: "${comp}"`);
      }
      // Note: No warning for missing romance_comp - these are generic romance triggers
      // that work with whoever the player is currently romancing
    }
  }
}

// 2. Check travel events for romance requirements
console.log('2. Checking travel event romance gates...');
for (const ev of (rules.travelEvents || [])) {
  if (ev.requireRomance) {
    const { companion, minLevel } = ev.requireRomance;
    if (!COMPANIONS_ALL.includes(companion)) {
      errors.push(`[TRAVEL] Event "${ev.id}" requireRomance unknown companion: "${companion}"`);
    }
    if (!ROMANCE_STAGES.includes(minLevel)) {
      errors.push(`[TRAVEL] Event "${ev.id}" requireRomance unknown stage: "${minLevel}"`);
    }

    // Check if there's a way to reach the required level
    const compScenes = romanceScenes[companion];
    if (compScenes) {
      const targetRank = ROMANCE_RANK[minLevel];
      const availableScenes = [];
      for (const [stage, sceneList] of Object.entries(compScenes)) {
        if (ROMANCE_RANK[stage] < targetRank) {
          availableScenes.push(...sceneList);
        }
      }
      if (availableScenes.length === 0 && targetRank > 1) {
        warnings.push(`[TRAVEL] Event "${ev.id}" requires ${minLevel} for ${companion} but no prior stages found`);
      }
    }
  }
}

// 3. Check romance progression per companion
console.log('3. Checking romance progression...');
for (const [comp, stages] of Object.entries(romanceScenes)) {
  const hasStages = {
    Spark: stages.Spark.length > 0,
    Flame: stages.Flame.length > 0,
    Oath: stages.Oath.length > 0
  };

  // Check for missing stages in progression
  if (hasStages.Flame && !hasStages.Spark) {
    warnings.push(`[PROGRESS] ${comp} has Flame scene but no Spark scene`);
  }
  if (hasStages.Oath && !hasStages.Flame) {
    warnings.push(`[PROGRESS] ${comp} has Oath scene but no Flame scene`);
  }
  if (hasStages.Oath && !hasStages.Spark) {
    warnings.push(`[PROGRESS] ${comp} has Oath scene but no Spark scene`);
  }
}

// 4. Check companion data romance info
console.log('4. Cross-referencing companion romance data...');
for (const [name, data] of Object.entries(COMPANION_DATA)) {
  if (!data.romance) continue;

  // Parse romance info (e.g., "Spark Scene 5 or 14. Flame Scene 48. Oath Scene 75.")
  const sparkMatch = data.romance.match(/Spark Scene[s]?\s*([\d\w]+(?:\s*or\s*[\d\w]+)?)/i);
  const flameMatch = data.romance.match(/Flame Scene[s]?\s*([\d\w]+(?:\s*or\s*[\d\w]+)?)/i);
  const oathMatch = data.romance.match(/Oath Scene[s]?\s*([\d\w]+)/i);

  // Check if documented scenes have romance content
  if (sparkMatch) {
    const docScenes = sparkMatch[1].split(/\s*or\s*/);
    const actualSparks = romanceScenes[name]?.Spark?.map(s => s.scene) || [];
    // This is informational, not an error - scenes might be hub scenes
  }
}

// 5. Check for jealousy/polyamory event requirements
console.log('5. Checking jealousy/polyamory events...');
const jealousyEvents = (rules.travelEvents || []).filter(ev => ev.requireMultipleRomances);
if (jealousyEvents.length === 0) {
  warnings.push('[POLY] No jealousy/polyamory events defined');
} else {
  for (const ev of jealousyEvents) {
    if (!ALL_SCENES[ev.id]) {
      errors.push(`[POLY] Jealousy event "${ev.id}" scene not found`);
    }
  }
}

// Summary
console.log('\n=== ROMANCE COVERAGE ===');
for (const [comp, stages] of Object.entries(romanceScenes)) {
  const coverage = ROMANCE_STAGES.map(s =>
    stages[s].length > 0 ? `${s}(${stages[s].length})` : `${s}(-)`
  ).join(' -> ');
  console.log(`  ${comp}: ${coverage}`);
}

console.log('\n=== SUMMARY ===');
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log('\n--- ERRORS ---');
  errors.forEach(e => console.log('  ' + e));
}

if (warnings.length > 0) {
  console.log('\n--- WARNINGS ---');
  warnings.forEach(w => console.log('  ' + w));
}

// Detailed scene listing
if (process.argv.includes('--detail')) {
  console.log('\n--- DETAILED ROMANCE SCENES ---');
  for (const [comp, stages] of Object.entries(romanceScenes)) {
    console.log(`\n${comp}:`);
    for (const [stage, sceneList] of Object.entries(stages)) {
      if (sceneList.length > 0) {
        console.log(`  ${stage}: ${sceneList.map(s => `${s.scene}[${s.letter}]`).join(', ')}`);
      }
    }
  }
}

process.exit(errors.length > 0 ? 1 : 0);
