# Knights Oath — Claude Code Guide

## Project Overview
Single-file browser RPG (index.html, ~7100 lines). D&D 5e 2024 rules, Dragonlance setting. React (createElement, no JSX), inline CSS+JS. No build system, no backend.

## Architecture Map (line ranges shift with edits — verify before citing)

### Structure
| Section | Approx Lines |
|---------|-------------|
| CSS | 11–1099 |
| Constants & Data | 1100–3250 |
| Combat Narration/Outcomes | 1957–5019 |
| Utility Functions | 1181–1550 |
| Components | 1798–6400 |
| App + Game Logic | 6700–7145 |

### Key Constants
- `SCENES` — 220+ scene objects (line ~1124, massive minified JSON)
- `COMBAT_NARRATION` — per-scene DM narrator text (~1957–3231)
- `COMBAT_OUTCOMES` — per-scene victory/defeat variants (~3232–5019)
- `WEAPONS_WITH_MASTERY` — 28 weapons with D&D 5e mastery (~1407)
- `STARTING_ARMOR` / `ARMOR_NAMES` — armor definitions (~1450)
- `EQUIPMENT_SLOTS` — 11 equipment slots (~1458)
- `COMPANION_COMBAT_STATS` — companion AC/HP/attacks (~1552)
- `SELL_PRICES` / `UNSELLABLE` — shop economics (~5020)
- `SPELL_DATA` / `SPELL_LISTS` — spell definitions (~1126, 1393)

### Key Functions
- `calcAC(armor, hasShield, dexMod)` ~1181
- `calcDerived(stats, cls, lvl, armor, hasShield, feat, wounds)` ~1185
- `getItemSlot(name)` / `equipItem(gs, item, slot)` / `unequipItem(gs, slot)` ~1472
- `getSlotOptions(gs, slotId)` / `categorizeItem(name)` ~1508
- `parseCombatBox(text)` ~3346
- `parseShopBox(text)` ~5000
- `parseLootBox(text)` ~5249

### React Components
- `RollBox` — skill/ability check UI (~1798)
- `CombatBox` — full combat system (~3552–5000)
- `ShopBox` — buy/sell interface (~5032)
- `LootBox` — post-combat loot (~5271)
- `CharCreate` — character creation wizard (~5489)
- `SceneView` — scene rendering (~5949)
- `CharSheet` — full character sheet with equipment (~5981)
- `App` — main component, all game state (~6700)

### Game State (gs object)
Core fields: `cls, stats, weapon, armor, hasShield, equipment, level, hp, derived, xp, honour, rose, sword, crown, companions, romances, inventory, history, flags, wounds, scars, gold, bandages, potions, greaterPotions, spells, godSigns`

### Critical Functions in App
- `goScene(id, state)` ~6765 — scene transitions, box processing, disgrace check
- `startGame({...})` ~6864 — initial state creation
- `loadSave(saveData)` ~6865 — save migration
- `handleChoice(choice)` ~6872 — choice processing, order points, romance, god signs
- `handleStateUpdate(updater)` ~6972 — generic state update with recalc

## Workflow Rules
1. **Source of truth**: Edit markdown files first, then sync to HTML
2. **Version bump**: Always bump version before every push (X.x.x scheme)
3. **Loading screen**: Update version + scene count in loading screen before push
4. **Scene transitions**: Write full prose, not just menus
5. **Equipment sync**: `gs.weapon`/`gs.armor`/`gs.hasShield` are synced from `gs.equipment` via `syncEquipToState()`
6. **Combat narration**: Every fight needs a COMBAT_NARRATION entry

## Common Patterns
- State updates: `const ns={...gs,...changes}; ns.derived=calcDerived(...); setGs(ns);`
- Equipment changes: use `equipItem(gs, itemName, slotId)` / `unequipItem(gs, slotId)` — they handle sync + recalc
- Adding inventory items in goScene: check `ADD TO INVENTORY` box type parsing (~line 6798)
- Flags: `gs.flags.flagName` for story state tracking
