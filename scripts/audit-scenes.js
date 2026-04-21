#!/usr/bin/env node
/**
 * Scene Audit Script — Structural integrity and target validation
 * Run: node scripts/audit-scenes.js
 */

const fs = require('fs');
const path = require('path');

const MODULE_DIR = path.join(__dirname, '..', 'modules', 'knights-oath');

// Load all data
const scenes = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'scenes.json')));
const scenesDeferred = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'scenes-deferred.json')));
const rules = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'rules.json')));
const companions = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'companions.json')));

const ALL_SCENES = { ...scenes, ...scenesDeferred };
const SCENE_IDS = new Set(Object.keys(ALL_SCENES));
const SPECIAL_TARGETS = new Set(['RETURN', 'RETURN_TRAVEL']);
const COMPANIONS_ALL = companions.all;

const errors = [];
const warnings = [];

console.log('=== SCENE AUDIT ===\n');
console.log(`Total scenes: ${SCENE_IDS.size}`);
console.log(`Primary: ${Object.keys(scenes).length}, Deferred: ${Object.keys(scenesDeferred).length}\n`);

// 1. Check required fields
console.log('1. Checking required fields...');
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.id) errors.push(`[STRUCT] Scene "${id}" missing 'id' field`);
  if (scene.id && scene.id !== id) errors.push(`[STRUCT] Scene "${id}" has mismatched id: "${scene.id}"`);
  if (!scene.title) warnings.push(`[STRUCT] Scene "${id}" missing 'title' field`);
  if (!scene.prose || !Array.isArray(scene.prose)) warnings.push(`[STRUCT] Scene "${id}" missing/invalid 'prose' array`);
  if (!scene.choices || !Array.isArray(scene.choices)) {
    if (!rules.endingScenes?.includes(id)) {
      warnings.push(`[STRUCT] Scene "${id}" missing 'choices' array (not an ending)`);
    }
  }
}

// 2. Check choice structure
console.log('2. Checking choice structure...');
// Special choice letters that can have null/no target (display-only choices)
const DISPLAY_ONLY_CHOICES = /^(R\d+|G|SUCCESS|FAILURE|WIN|LOSE)$/;
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (!choice.letter) errors.push(`[CHOICE] Scene "${id}" has choice missing 'letter'`);
    if (!choice.text) warnings.push(`[CHOICE] Scene "${id}" choice ${choice.letter} missing 'text'`);
    // Target is only required for navigational choices (A, B, C, D, etc.)
    if (!choice.target && choice.target !== null && !DISPLAY_ONLY_CHOICES.test(choice.letter)) {
      errors.push(`[CHOICE] Scene "${id}" choice ${choice.letter} missing 'target'`);
    }
  }
}

// 3. Validate targets
console.log('3. Validating choice targets...');
const brokenTargets = [];
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (!choice.target) continue;
    if (SPECIAL_TARGETS.has(choice.target)) continue;
    if (!SCENE_IDS.has(choice.target)) {
      brokenTargets.push({ scene: id, letter: choice.letter, target: choice.target });
      errors.push(`[TARGET] Scene "${id}" choice ${choice.letter} -> "${choice.target}" (not found)`);
    }
  }
}

// 4. Check for dead ends
console.log('4. Checking for dead ends...');
const endingScenes = new Set(rules.endingScenes || []);
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (endingScenes.has(id)) continue;
  if (!scene.choices || scene.choices.length === 0) {
    errors.push(`[DEADEND] Scene "${id}" has no choices and is not an ending`);
  }
}

// 5. Check duplicate IDs
console.log('5. Checking for duplicate IDs...');
const primaryIds = new Set(Object.keys(scenes));
const deferredIds = new Set(Object.keys(scenesDeferred));
for (const id of primaryIds) {
  if (deferredIds.has(id)) {
    errors.push(`[DUPLICATE] Scene "${id}" exists in both scenes.json and scenes-deferred.json`);
  }
}

// 6. Validate companion names in approvals
console.log('6. Validating companion references...');
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (choice.approval) {
      for (const comp of Object.keys(choice.approval)) {
        if (!COMPANIONS_ALL.includes(comp)) {
          errors.push(`[COMPANION] Scene "${id}" choice ${choice.letter} has invalid companion: "${comp}"`);
        }
      }
    }
    if (choice.romance_comp && !COMPANIONS_ALL.includes(choice.romance_comp)) {
      errors.push(`[COMPANION] Scene "${id}" choice ${choice.letter} has invalid romance_comp: "${choice.romance_comp}"`);
    }
  }
}

// 7. Validate points structure
console.log('7. Validating points structure...');
const VALID_POINTS = new Set(['ROSE', 'SWORD', 'CROWN', 'honour']);
for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (choice.points) {
      for (const key of Object.keys(choice.points)) {
        if (!VALID_POINTS.has(key)) {
          warnings.push(`[POINTS] Scene "${id}" choice ${choice.letter} has unknown point type: "${key}"`);
        }
      }
    }
  }
}

// 8. Check ending scenes exist
console.log('8. Validating ending scenes...');
for (const endId of (rules.endingScenes || [])) {
  if (!SCENE_IDS.has(endId)) {
    errors.push(`[ENDING] Ending scene "${endId}" not found in scene files`);
  }
}

// 9. Check travel events
console.log('9. Validating travel events...');
for (const ev of (rules.travelEvents || [])) {
  if (!SCENE_IDS.has(ev.id)) {
    errors.push(`[TRAVEL] Travel event "${ev.id}" scene not found`);
  }
  for (const trigger of (ev.triggerScenes || [])) {
    if (!SCENE_IDS.has(trigger)) {
      warnings.push(`[TRAVEL] Travel event "${ev.id}" trigger scene "${trigger}" not found`);
    }
  }
  if (ev.requireCompanion && !COMPANIONS_ALL.includes(ev.requireCompanion)) {
    errors.push(`[TRAVEL] Travel event "${ev.id}" has invalid companion: "${ev.requireCompanion}"`);
  }
}

// 10. Check choiceFlags reference valid scenes
console.log('10. Validating choiceFlags...');
for (const rule of (rules.choiceFlags || [])) {
  if (!SCENE_IDS.has(rule.scene)) {
    errors.push(`[RULES] choiceFlags references non-existent scene: "${rule.scene}"`);
  }
}

// Summary
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

if (brokenTargets.length > 0) {
  console.log('\n--- BROKEN TARGETS ---');
  brokenTargets.forEach(t => console.log(`  ${t.scene} [${t.letter}] -> ${t.target}`));
}

process.exit(errors.length > 0 ? 1 : 0);
