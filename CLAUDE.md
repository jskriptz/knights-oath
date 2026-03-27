# Knights Oath — Claude Code Guide

## Project Overview
Multi-campaign browser RPG engine (index.html, ~6160 lines) with campaign data in JSON. D&D 5e 2024 rules, Dragonlance setting. React (createElement, no JSX), inline CSS+JS. No build system, no backend. Standalone single-file builds via `node scripts/build-standalone.js`.

## Project Structure
```
index.html                          — engine (6160 lines)
campaigns/index.json                — campaign registry
campaigns/knights-oath/
  campaign.json                     — manifest: title, classes, intro, files list
  scenes.json                       — 104 primary scenes
  scenes-deferred.json              — 205 deferred scenes (lazy-loaded)
  combat-narration.json             — per-scene DM narrator text
  combat-outcomes.json              — per-scene victory/defeat variants
  companions.json                   — companion data, combat stats, romance
  companion-gifts.json              — skill gifts at max approval
  party-banter.json                 — 69 scene-triggered dialogue entries
  scene-effects.json                — companion departures, NPC breakups
  shop-data.json                    — sell prices, unsellable pattern
  rules.json                        — declarative scene logic (filters, flags, gates)
  dm-summary.json                   — DM chronicle for continuation campaigns
  epilogues.json                    — companion epilogue paragraphs
  theme.json                        — CSS vars, fonts, loading screen text
scripts/build-standalone.js         — builds dist/knights-oath.html (single file)
dist/knights-oath.html              — standalone build with embedded campaign data
```

## Architecture Map (line ranges shift with edits — verify before citing)

### Structure
| Section | Approx Lines |
|---------|-------------|
| CSS (loading screen + main) | 11–1196 |
| Script loading | 1207–1219 |
| Constants & Data declarations | 1220–1614 |
| Save system (split/merge/migrate) | 1612–1650 |
| Companion UI helpers | 1652–1680 |
| Roll Box (parser + component) | 1681–1899 |
| Dice helpers | 1900–1910 |
| Combat Narration/Outcomes (data vars) | 1911–1914 |
| Combat Box (parser + component) | 1916–3572 |
| Shop Box (parser + component) | 3573–3822 |
| Loot Box (parser + component) | 3823–3973 |
| Campaign Select | 3974–4006 |
| Cover Screen | 4007–4045 |
| World Intro | 4046–4067 |
| Character Creation | 4068–4259 |
| Sidebar | 4260–4288 |
| Save Picker | 4289–4318 |
| Scene filtering (filterBoxes, getMandatoryDetours, filterChoices) | 4319–4477 |
| Epilogue Block | 4480–4530 |
| Party Banter Block | 4531–4555 |
| Approval processing + toasts | 4556–4581 |
| Scene View | 4582–4616 |
| DM Summary (evaluator + component) | 4620–4768 |
| Character Sheet | 4769–5175 |
| App component + game logic | 5176–6130 |
| Campaign Loader | 5532–5658 |
| Boot sequence | 6131–6158 |

### Key Constants (declared as `let`, populated by campaign loader)
- `SCENES` — scene objects (populated from scenes.json + scenes-deferred.json) ~1222
- `COMBAT_NARRATION` / `COMBAT_OUTCOMES` — per-scene combat text ~1911
- `COMPANIONS_ALL` — companion name list ~1391
- `COMPANION_DATA` / `COMPANION_COMBAT_STATS` — companion details ~1567–1589
- `PARTY_BANTER` — scene-triggered companion dialogue ~1381
- `COMPANION_GIFTS` — skill gifts at max approval ~1382
- `SCENE_EFFECTS` / `NPC_BREAKUPS` — companion departures ~1378–1380
- `SELL_PRICES` / `UNSELLABLE` — shop economics ~3594–3596
- `CAMPAIGN_RULES` — declarative scene logic from rules.json ~5534
- `CAMPAIGN` — campaign manifest ~5533
- `EPILOGUES` / `DM_SUMMARY` — endgame content ~5535–5536
- `ENDING_SCENES` / `RELATIONSHIP_CHECK_SCENES` — scene ID lists ~1372, 1390
- `GODS` / `GOD_FLAVOUR` / `PRESETS` — class presets, god data ~1598, 5345, 1588

### Key Constants (engine, not campaign-loaded)
- `SPELL_DATA` / `SPELL_LISTS` — spell definitions ~1224, 1408
- `WEAPONS_WITH_MASTERY` — 28 weapons with D&D 5e mastery ~1422
- `STARTING_WEAPONS` / `STARTING_ARMOR` — creation options ~1452, 1465
- `EQUIPMENT_SLOTS` — 11 equipment slots ~1473
- `ARMOR_NAMES` — armor list ~1486
- `STD_ARRAY` / `STAT_NAMES` — character creation ~1392–1393
- `SCARS` / `WOUND_FLAVOUR` — defeat consequences ~1298, 1310
- `CHARACTER_FIELDS` / `CAMPAIGN_PROGRESS_FIELDS` — save field lists ~1613–1614

### Key Functions
- `calcAC(armor, hasShield, dexMod)` ~1279
- `calcDerived(stats, cls, lvl, armor, hasShield, feat, wounds)` ~1283
- `getBonus(derived, skill)` ~1296
- `getItemSlot(name)` / `equipItem(gs, item, slot)` / `unequipItem(gs, slot)` ~1487, 1512, 1529
- `getSlotOptions(gs, slotId)` / `categorizeItem(name)` ~1538, 1557
- `filterProse(proseArr, cls, companions)` ~1349
- `filterBoxes(boxes, gs)` ~4319
- `filterChoices(choices, sceneId, gs)` ~4371
- `getMandatoryDetours(sceneId, gs)` ~4342
- `processApproval(ns, sceneId, choiceLetter)` ~4557
- `parseCombatBox(text)` ~1916
- `parseShopBox(text)` ~3574
- `parseLootBox(text)` ~3824
- `splitSave(gs, sceneId)` / `mergeSave(char, progress)` ~1616, 1625
- `loadCampaign(campaignId)` ~5538
- `applyTheme(theme)` ~5647

### React Components
- `RollBox` — skill/ability check UI ~1747
- `CombatBox` — full combat system (5e 2024) ~2122
- `ShopBox` — buy/sell interface ~3606
- `LootBox` — post-combat loot ~3846
- `CampaignSelect` — campaign picker ~3975
- `CoverScreen` — title screen ~4008
- `WorldIntro` — lore pages before creation ~4047
- `CharCreate` — character creation wizard ~4069
- `Sidebar` — collapsible game sidebar ~4261
- `SavePicker` — save slot management ~4290
- `EpilogueBlock` — companion epilogues ~4481
- `BanterBlock` — party banter in scenes ~4532
- `SceneView` — scene rendering, choices, detours ~4583
- `DmSummary` — printable DM chronicle ~4644
- `CharSheet` — full character sheet with equipment ~4769
- `NpcNotification` — companion departure/gift/confrontation modals ~5182
- `BreakupScene` — romance breakup handling ~5207
- `RomanceManage` — romance status management ~5238
- `RelationshipCheck` — companion relationship events ~5271
- `RomancePrompt` — romance progression prompts ~5317
- `GodSignPicker` — Paladin god tally picker ~5347
- `DefeatRecoveryModal` — wound/scar after combat loss ~5360
- `ShortRestModal` — hit dice spending ~5391
- `HealingPanel` — out-of-combat healing ~5431
- `SpellPrepModal` — Paladin spell preparation ~5503
- `ConfirmModal` — generic yes/no modal ~5522
- `App` — main component, all game state ~5660

### Game State (gs object)
**Character fields** (persistent across campaigns):
`cls, stats, style, feat, mastery, name, spells, weapon, armor, hasShield, equipment, inventory, level, hp, xp, honour, gold, bandages, potions, greaterPotions, wounds, scars, bonuses, magicItems, skilledPicks, classSkills, humanSkill, companionGifts`

**Campaign progress fields** (per-campaign):
`history, flags, awardedScenes, completedRolls, companions, romances, romanceDeclined, companionLog, deadCompanions, rose, sword, crown, orderMax, dgTrack, godSigns, hitDiceUsed, secondWindUsed, actionSurgeUsed, spellSlotsUsed, layOnHandsPool, miraHealedThisScene, combatCount, measureTrack, measureOrientation, approval`

**Derived** (recalculated, not saved): `derived` (maxHp, ac, profBonus, all ability mods, save mods, skill mods)

### Critical Functions in App
- `goScene(id, state)` ~5677 — scene transitions, box processing, disgrace check, item/flag parsing
- `startGame({...})` ~5780 — initial state creation from character creation
- `loadSave(saveData)` ~5788 — save migration (v1 legacy + v2 split format)
- `handleChoice(choice)` ~5814 — choice processing, order points, romance, god signs, approval, scene effects, choiceFlags
- `handleStateUpdate(updater)` ~6040 — generic state update with recalc
- `dismissNpcNotify()` ~5992 — handles gift bonuses, confrontation resolution, then navigates to next scene

### Save System (v2 split format)
- `splitSave(gs, sceneId)` — splits gs into `{character, progress}` using CHARACTER_FIELDS / CAMPAIGN_PROGRESS_FIELDS
- `mergeSave(character, progress)` — recombines for runtime
- `migrateLegacySave(saveData)` — auto-upgrades v1 single-blob saves
- Saves stored in localStorage as `save_<slot>` with `saveVersion: 2`

### Campaign Loader
- `loadCampaign(campaignId)` ~5538 — fetches all JSON in parallel, populates global vars
- Standalone mode: reads `window.__STANDALONE_CAMPAIGN__` + `window.__STANDALONE_DATA__` (embedded by build script)
- Fetch mode: reads from `campaigns/<id>/` directory
- Deferred scenes loaded after 100ms timeout to keep UI responsive

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
1. **Source of truth**: Campaign data lives in JSON files under `campaigns/`. Engine logic in `index.html`.
2. **Version bump**: Always bump version in campaign.json + theme.json before every push
3. **Loading screen**: theme.json `loadingScreen` controls version + scene count display
4. **Standalone build**: Run `node scripts/build-standalone.js` before push to update dist/
5. **Scene transitions**: Write full prose, not just menus
6. **Equipment sync**: `gs.weapon`/`gs.armor`/`gs.hasShield` are synced from `gs.equipment` via `syncEquipToState()`
7. **Combat narration**: Every fight needs a COMBAT_NARRATION entry in combat-narration.json

## Common Patterns
- State updates: `const ns={...gs,...changes}; ns.derived=calcDerived(...); setGs(ns);`
- Equipment changes: use `equipItem(gs, itemName, slotId)` / `unequipItem(gs, slotId)` — they handle sync + recalc
- Adding inventory items in goScene: parsed from `ADD TO INVENTORY` boxes ~5709
- Flags: `gs.flags.flagName` for story state tracking
- Approval: `gs.approval[companionName]` — integer score, -5 to +8
- Campaign rules: always access via `CAMPAIGN_RULES?.property` (may be null before load)
- Data format: `choiceFlags` use `letters: ["A"]` (array), `choiceFilters` use `letter: "A"` or `letters: ["A","B"]`
