#!/usr/bin/env node
/**
 * Reachability Audit Script — Graph traversal from scene 1
 * Run: node scripts/audit-reachability.js
 */

const fs = require('fs');
const path = require('path');

const MODULE_DIR = path.join(__dirname, '..', 'modules', 'knights-oath');

const scenes = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'scenes.json')));
const scenesDeferred = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'scenes-deferred.json')));
const rules = JSON.parse(fs.readFileSync(path.join(MODULE_DIR, 'rules.json')));

const ALL_SCENES = { ...scenes, ...scenesDeferred };
const SCENE_IDS = Object.keys(ALL_SCENES);
const SPECIAL_TARGETS = new Set(['RETURN', 'RETURN_TRAVEL']);

const errors = [];
const warnings = [];

console.log('=== REACHABILITY AUDIT ===\n');
console.log(`Total scenes: ${SCENE_IDS.length}`);

// Build adjacency graph
console.log('1. Building scene graph...');
const graph = {};
const reverseGraph = {};
for (const id of SCENE_IDS) {
  graph[id] = new Set();
  reverseGraph[id] = new Set();
}

for (const [id, scene] of Object.entries(ALL_SCENES)) {
  if (!scene.choices) continue;
  for (const choice of scene.choices) {
    if (!choice.target) continue;
    if (SPECIAL_TARGETS.has(choice.target)) continue;
    if (ALL_SCENES[choice.target]) {
      graph[id].add(choice.target);
      reverseGraph[choice.target].add(id);
    }
  }
}

// Add travel event targets (they can redirect to event scenes)
for (const ev of (rules.travelEvents || [])) {
  if (ALL_SCENES[ev.id]) {
    for (const trigger of (ev.triggerScenes || [])) {
      if (graph[trigger]) {
        graph[trigger].add(ev.id);
        reverseGraph[ev.id].add(trigger);
      }
    }
  }
}

// BFS from start scene
console.log('2. Finding reachable scenes from "1"...');
const startScene = rules.startScene || '1';
const reachable = new Set();
const queue = [startScene];
reachable.add(startScene);

while (queue.length > 0) {
  const current = queue.shift();
  for (const next of (graph[current] || [])) {
    if (!reachable.has(next)) {
      reachable.add(next);
      queue.push(next);
    }
  }
}

console.log(`   Reachable: ${reachable.size} / ${SCENE_IDS.length}`);

// Find unreachable scenes
const unreachable = SCENE_IDS.filter(id => !reachable.has(id));

// Categorize unreachable
const unreachableCategories = {
  endings: [],
  events: [],
  hubs: [],
  other: []
};

const endingScenes = new Set(rules.endingScenes || []);
const hubScenes = new Set(rules.hubScenes || []);
// Prefixes for dynamically-linked scenes (triggered by game systems, not direct links)
const eventPrefixes = [
  'TEMPT_', 'DEPTH_', 'FLAME_', 'OATH_', 'DIVINE_', 'MENTOR_', 'JEALOUSY_', 'POLYAMORY_',
  'ARC_',       // Companion arc scenes (triggered by approval thresholds)
  'CONFRONT_',  // Confrontation scenes (triggered by low approval)
  'GIFT_',      // Gift scenes (triggered by max approval)
  'CEREMONY_',  // Ceremony variants (triggered by order point ties)
  'EPILOGUE_',  // Epilogue variations (triggered by endgame state)
  'F1_', 'F2_', 'F3_', 'F4_'  // Fighter side content
];

for (const id of unreachable) {
  if (endingScenes.has(id)) {
    unreachableCategories.endings.push(id);
  } else if (eventPrefixes.some(p => id.startsWith(p))) {
    unreachableCategories.events.push(id);
  } else if (hubScenes.has(id)) {
    unreachableCategories.hubs.push(id);
  } else {
    unreachableCategories.other.push(id);
  }
}

// Events are expected to be "unreachable" via normal graph (triggered by travel events)
// So we only error on truly orphaned scenes
if (unreachableCategories.other.length > 0) {
  for (const id of unreachableCategories.other) {
    // Check if it's pointed to by anything
    const incomingEdges = reverseGraph[id]?.size || 0;
    if (incomingEdges === 0) {
      errors.push(`[ORPHAN] Scene "${id}" has no incoming edges and isn't reachable`);
    } else {
      warnings.push(`[UNREACHABLE] Scene "${id}" not reachable from start (but has ${incomingEdges} incoming edges)`);
    }
  }
}

// 3. Check for orphaned event scenes (travel events that don't exist)
console.log('3. Checking event scene coverage...');
const travelEventIds = new Set((rules.travelEvents || []).map(ev => ev.id));
// System-triggered prefixes: these are triggered by game systems, not travel events
const systemTriggeredPrefixes = ['ARC_', 'CONFRONT_', 'GIFT_', 'CEREMONY_', 'EPILOGUE_'];
for (const id of unreachableCategories.events) {
  // Skip scenes triggered by game systems (approval, endings, etc.) rather than travel events
  if (systemTriggeredPrefixes.some(p => id.startsWith(p))) continue;
  if (!travelEventIds.has(id)) {
    warnings.push(`[EVENT] Scene "${id}" looks like an event but has no travel event trigger`);
  }
}

// 4. Check for loops
console.log('4. Detecting potential infinite loops...');
const visitedInPath = new Set();
const loopsFound = [];

function detectLoops(node, path) {
  if (path.includes(node)) {
    const loopStart = path.indexOf(node);
    const loop = path.slice(loopStart).concat(node);
    // Only report if it's a short loop (likely unintentional)
    if (loop.length <= 4) {
      const loopStr = loop.join(' -> ');
      if (!loopsFound.includes(loopStr)) {
        loopsFound.push(loopStr);
      }
    }
    return;
  }
  if (visitedInPath.has(node)) return;
  visitedInPath.add(node);

  const newPath = [...path, node];
  for (const next of (graph[node] || [])) {
    detectLoops(next, newPath);
  }
}

detectLoops(startScene, []);

if (loopsFound.length > 0) {
  console.log(`   Found ${loopsFound.length} short loops (may be intentional):`);
  loopsFound.slice(0, 10).forEach(l => console.log(`     ${l}`));
  if (loopsFound.length > 10) console.log(`     ... and ${loopsFound.length - 10} more`);
}

// 5. Check ending reachability
console.log('5. Checking ending reachability...');
// Some endings are triggered by game logic (DISGRACE, EPILOGUE_*), not graph navigation
const systemTriggeredEndings = ['DISGRACE', 'EPILOGUE_'];
for (const endId of endingScenes) {
  if (!reachable.has(endId)) {
    // Skip warning for system-triggered endings
    if (systemTriggeredEndings.some(prefix => endId.startsWith(prefix) || endId === prefix)) continue;
    warnings.push(`[ENDING] Ending scene "${endId}" may not be reachable`);
  }
}

// Summary
console.log('\n=== REACHABILITY SUMMARY ===');
console.log(`  Reachable scenes: ${reachable.size}`);
console.log(`  Unreachable scenes: ${unreachable.length}`);
console.log(`    - Event scenes: ${unreachableCategories.events.length} (expected - triggered by travel events)`);
console.log(`    - Hub scenes: ${unreachableCategories.hubs.length}`);
console.log(`    - Other: ${unreachableCategories.other.length}`);

if (unreachableCategories.other.length > 0) {
  console.log('\n  Potentially orphaned scenes:');
  unreachableCategories.other.forEach(id => console.log(`    - ${id}`));
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

// Detailed unreachable list
if (process.argv.includes('--detail')) {
  console.log('\n--- ALL UNREACHABLE SCENES ---');
  unreachable.forEach(id => {
    const incoming = reverseGraph[id]?.size || 0;
    const category = endingScenes.has(id) ? 'ending' :
                    eventPrefixes.some(p => id.startsWith(p)) ? 'event' :
                    hubScenes.has(id) ? 'hub' : 'other';
    console.log(`  ${id} [${category}] (${incoming} incoming)`);
  });
}

process.exit(errors.length > 0 ? 1 : 0);
