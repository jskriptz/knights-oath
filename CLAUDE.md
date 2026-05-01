# Knights Oath — Claude Code Guide

## Project Overview
Multi-module browser RPG engine (index.html, ~13000 lines) with module data in JSON. D&D 5e 2024 rules, Dragonlance setting. React (createElement, no JSX), inline CSS+JS. No build system, no backend. Standalone single-file builds via `node scripts/build-standalone.js`.

## Terminology
- **Campaign**: Multiple modules tied together into one epic story
- **Module**: A single-shot adventure (this is the unit of content)

## Project Structure
```
index.html                          — engine (~13000 lines)
modules/index.json                  — module registry
modules/knights-oath/
  module.json                       — manifest: title, classes, intro, files list
  scenes.json                       — 104 primary scenes
  scenes-deferred.json              — 279 deferred scenes (lazy-loaded)
  combat-narration.json             — per-scene DM narrator text
  combat-outcomes.json              — per-scene victory/defeat variants
  companions.json                   — companion data, combat stats, romance
  companion-gifts.json              — skill gifts at max approval
  party-banter.json                 — 106 scene-triggered dialogue entries
  scene-effects.json                — companion departures, NPC breakups
  shop-data.json                    — sell prices, unsellable pattern
  rules.json                        — declarative scene logic (filters, flags, gates)
  dm-summary.json                   — DM chronicle for continuation modules
  epilogues.json                    — companion epilogue paragraphs
  theme.json                        — CSS vars, fonts, loading screen text
scripts/build-standalone.js         — builds dist/knights-oath.html (single file)
dist/knights-oath.html              — standalone build with embedded module data
```

## Architecture Map (line ranges shift with edits — verify before citing)

### Key Constants (declared as `let`, populated by module loader)
- `SCENES` — scene objects (populated from scenes.json + scenes-deferred.json)
- `COMBAT_NARRATION` / `COMBAT_OUTCOMES` — per-scene combat text
- `COMPANIONS_ALL` — companion name list
- `COMPANION_DATA` / `COMPANION_COMBAT_STATS` — companion details
- `PARTY_BANTER` — scene-triggered companion dialogue
- `COMPANION_GIFTS` — skill gifts at max approval
- `SCENE_EFFECTS` / `NPC_BREAKUPS` — companion departures
- `SELL_PRICES` / `UNSELLABLE` — shop economics
- `MODULE_RULES` — declarative scene logic from rules.json
- `MODULE` — module manifest
- `EPILOGUES` / `DM_SUMMARY` — endgame content
- `ENDING_SCENES` / `RELATIONSHIP_CHECK_SCENES` — scene ID lists
- `GODS` / `GOD_FLAVOUR` / `PRESETS` — class presets, god data

### Key Constants (engine, not module-loaded)
- `SPELL_DATA` / `SPELL_LISTS` — spell definitions
- `WEAPONS_WITH_MASTERY` — 28 weapons with D&D 5e mastery
- `STARTING_WEAPONS` / `STARTING_ARMOR` — creation options
- `EQUIPMENT_SLOTS` — 11 equipment slots
- `ARMOR_NAMES` — armor list
- `STD_ARRAY` / `STAT_NAMES` — character creation
- `SCARS` / `WOUND_FLAVOUR` — defeat consequences
- `CHARACTER_FIELDS` / `MODULE_PROGRESS_FIELDS` — save field lists

### Key Functions
- `calcAC(armor, hasShield, dexMod)`
- `calcDerived(stats, cls, lvl, armor, hasShield, feat, wounds)`
- `getBonus(derived, skill)`
- `getItemSlot(name)` / `equipItem(gs, item, slot)` / `unequipItem(gs, slot)`
- `getSlotOptions(gs, slotId)` / `categorizeItem(name)`
- `filterProse(proseArr, cls, companions)`
- `filterBoxes(boxes, gs)`
- `filterChoices(choices, sceneId, gs)`
- `getMandatoryDetours(sceneId, gs)`
- `processApproval(ns, sceneId, choiceLetter)`
- `parseCombatBox(text)`
- `parseShopBox(text)`
- `parseLootBox(text)`
- `splitSave(gs, sceneId)` / `mergeSave(char, progress)`
- `loadModule(moduleId)` — fetches all JSON in parallel, populates global vars
- `applyTheme(theme)`
- `addItemWithTracking(gs, itemName, sceneId)` — tracks item acquisition for timeline filtering

### React Components
- `RollBox` — skill/ability check UI
- `CombatBox` — full combat system (5e 2024)
- `ShopBox` — buy/sell interface
- `LootBox` — post-combat loot
- `ModuleSelect` — module picker
- `CoverScreen` — title screen
- `WorldIntro` — lore pages before creation
- `CharCreate` — character creation wizard
- `Sidebar` — collapsible game sidebar
- `SavePicker` — save slot management
- `EpilogueBlock` — companion epilogues
- `BanterBlock` — party banter in scenes
- `SceneView` — scene rendering, choices, detours
- `DmSummary` — printable DM chronicle
- `CharSheet` — full character sheet with equipment
- `ModuleSwitchModal` — 3-step module switching (Select → Mode → Confirm)
- `ImportCharacterModal` — character import for continuation modules
- `App` — main component, all game state

### Game State (gs object)
**Character fields** (persistent across modules):
`cls, stats, style, feat, mastery, name, spells, weapon, armor, hasShield, equipment, inventory, inventoryMeta, level, hp, xp, honour, gold, bandages, potions, greaterPotions, wounds, scars, bonuses, magicItems, skilledPicks, classSkills, humanSkill, companionGifts, completedModules, titles, selectedTitle, levelSnapshots, scaledFrom, currentCampaign, campaignProgress, sagaFlags, species, speciesTraits, learnedSpellCount`

**Module progress fields** (per-module):
`history, flags, awardedScenes, completedRolls, companions, romances, romanceDeclined, companionLog, deadCompanions, rose, sword, crown, orderMax, dgTrack, godSigns, hitDiceUsed, secondWindUsed, actionSurgeUsed, spellSlotsUsed, layOnHandsPool, miraHealedThisScene, combatCount, measureTrack, measureOrientation, approval`

**Derived** (recalculated, not saved): `derived` (maxHp, ac, profBonus, all ability mods, save mods, skill mods)

### Save System (v2 split format)
- `splitSave(gs, sceneId)` — splits gs into `{character, progress}` using CHARACTER_FIELDS / MODULE_PROGRESS_FIELDS
- `mergeSave(character, progress)` — recombines for runtime
- `migrateLegacySave(saveData)` — auto-upgrades v1 single-blob saves
- Saves stored in localStorage as `save_<slot>` with `saveVersion: 2`

### Module Loader
- `loadModule(moduleId)` — fetches all JSON in parallel, populates global vars
- Standalone mode: reads `window.__STANDALONE_MODULE__` + `window.__STANDALONE_DATA__` (embedded by build script)
- Fetch mode: reads from `modules/<id>/` directory
- Deferred scenes loaded after 100ms timeout to keep UI responsive

### Module Switch System
- `handleModuleSwitch(targetModuleId, mode, saveSlot)` — handles module transitions
- Modes: 'continue' (resume existing progress), 'transfer' (bring character), 'fresh' (new character)
- Timeline filtering: items with `inventoryMeta[item].date <= targetModule.date` are kept
- Level scaling: `scaleCharacterToLevel()` stores state in `scaledFrom.fullState`
- Level restoration: `restoreOriginalLevel()` restores from fullState, merges newly learned abilities

## rules.json Schema (declarative scene logic)
Key sections in rules.json that drive engine behavior:
- `startScene` — first scene ID
- `endingScenes` — array of ending scene IDs
- `hubScenes` — hub scenes with visit-gating
- `exemptTargets` — targets exempt from hub visit-gating
- `noLootScenes` — scenes that skip post-combat loot
- `choiceFilters` — hide/disable choices by class, flag, or awarded scenes
- `choiceFlags` — set flags / add items when specific choices are made
- `targetOverrides` — redirect targets based on class
- `classTargetGates` — restrict targets/prefixes to a class
- `dgTrackGates` — restrict targets by Paladin dark god track
- `companionChoiceGates` — require companion in party for choice
- `hubCompanionSwaps` — swap choice text/target when companion missing
- `mandatoryDetours` — forced scene visits before choices (with requireCompanion, requireFlag)
- `approvalDeltas` — companion approval changes per scene+letter
- `specialCombat` — boar fight / duel scene lists
- `bundleExpansions` — expand item bundles into components

## Workflow Rules
1. **Source of truth**: Module data lives in JSON files under `modules/`. Engine logic in `index.html`.
2. **Version bump**: Always bump version in module.json + theme.json before every push
3. **Loading screen**: theme.json `loadingScreen` controls version + scene count display
4. **Standalone build**: Run `node scripts/build-standalone.js` before push to update dist/
5. **Scene transitions**: Write full prose, not just menus
6. **Equipment sync**: `gs.weapon`/`gs.armor`/`gs.hasShield` are synced from `gs.equipment` via `syncEquipToState()`
7. **Combat narration**: Every fight needs a COMBAT_NARRATION entry in combat-narration.json

## Common Patterns
- State updates: `const ns={...gs,...changes}; ns.derived=calcDerived(...); setGs(ns);`
- Equipment changes: use `equipItem(gs, itemName, slotId)` / `unequipItem(gs, slotId)` — they handle sync + recalc
- Adding inventory items in goScene: parsed from `ADD TO INVENTORY` boxes
- Flags: `gs.flags.flagName` for story state tracking
- Approval: `gs.approval[companionName]` — integer score, -5 to +8
- Module rules: always access via `MODULE_RULES?.property` (may be null before load)
- Data format: `choiceFlags` use `letters: ["A"]` (array), `choiceFilters` use `letter: "A"` or `letters: ["A","B"]`
- Item tracking: use `addItemWithTracking(gs, itemName, sceneId)` for timeline-aware inventory

## Performance Optimizations
- `calcDerived` is memoized with 50-entry LRU cache (avoids recalculating unchanged stats)
- Auto-save is debounced (500ms) to prevent localStorage thrashing
- Heavy components wrapped in React.memo: `CombatBoxMemo`, `CharSheetMemo`, `SceneViewMemo`
- CSS vars for spacing/radius/shadow: `--gap-sm/md/lg`, `--radius`, `--radius-lg`, `--shadow`

## Android Workflow
After editing any web files (index.html, sw.js, manifest.json) or module JSON:
1. Run: `npm run sync`
   This copies files to www/ and syncs to Android assets
2. www/ is a build artifact — never edit files there directly
3. Always edit source files in project root, then sync
