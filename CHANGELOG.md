# Changelog

All notable changes to **Dragonlance: The Knight's Oath** are documented here.

## v19.1.1 — 2026-03-22

### Routing Completeness
- Added 6 missing romance choices to Scene 66B (Sera, Vael, Caeron, Tariel, Lysander, Poly)
- Added 5 Paladin divine question choices to Scene 60 (P3a-P3e)
- Added 5 class-conditional choices to Scene 61 (Fighter/Paladin/Measure/DG paths)
- Added 6 Paladin god selection choices to Scene 68C (P4_Paladine through P4_Unnamed)
- Updated markdown routing for DG4 (→62), M3 (→M4), M4 (→62) to match HTML restructuring
- Zero routing mismatches remain between markdown and HTML

## v19.1.0 — 2026-03-22

### Routing Overhaul
- Fixed 140+ scene choice target mismatches between markdown and HTML
- Hub 11: 33 scenes now correctly route to `11_MORNING`, `11_AFTERNOON`, or `11_EVENING` instead of flat `11`
- Hub 53: 29 scenes now route to `53_HUB` instead of bypassing to `54` or `60`
- Skipped intermediates restored: `62D→62E`, `64B→64C`, `67→68D`, `69→69_ROAD`, `70→70B`
- Fixed null targets in `66B_Lysander` and `66B_Tariel` romance scenes
- Fixed date scene names (`DATE_ALDRIC`, `DATE_THESSALY`, `DATE_MIRA`)
- Fixed individual mismatches: `27B→DG1`, `42→44`, `44→44_REPORT`, `BOND_HUB→11_NIGHT`

### Scene Transitions
- Added transitional prose to Scene 6 (courtyard crossing before meeting Thessaly)
- Added transitional prose to Scene 9 (corridor walk after east wing conversations)

## v19.0.5 — 2026-03-22

### Routing
- Fixed Scene 4 and Scene 5 routing to return to `1_HUB` instead of teleporting between NPCs mid-conversation

## v19.0.4 — 2026-03-22

### Bug Fix
- Paladins no longer get stuck in Scene 8 loop (Paladins skip `M1` and route directly to Scene 9)

## v19.0.3 — 2026-03-22

### UI
- CharSheet back button uses ghost style (not gold), both buttons properly sized
- Centered mobile bar stats and STL gold display in sidebar
- Fixed ability scores grid overflow on mobile

## v19.0.2 — 2026-03-22

### Version
- Bumped version number on title screen

## v19.0.1 — 2026-03-22

### Paladin & Combat
- Quick-start Paladin now has 3 prepared spells (added Cure Wounds)
- Paladins can change prepared spells at each Long Rest via spell prep modal
- Wandering knight weapon changed from longsword+shield to greatsword (Dawnstrike)
- Dawnstrike reworked: +1 Greatsword, Graze mastery, 2/day Radiant Strike, Dawn's Light, Last Stand

### UI
- Added version number (`v19.0.1`) to title screen footer
- Centered STL gold display in player menu

## v19.0.0 — 2026-03-22

### Initial Tracked Release
- Full scene restructuring: hub system (`1_HUB`, `11_MORNING/AFTERNOON/EVENING`, `53_HUB`), broken scene fixes, orphaned scene wiring
- Interactive combat system: `CombatBox` with narrative rounds, dual pen-and-paper/narrative mode, companion actions, ability usage (Smite, Second Wind, Action Surge, Lay on Hands, potions, bandages)
- Economy system: steel pieces (stl) currency, wage processing, `ShopBox` with buy/rare stock rolls, `LootBox` with moral choices and loot tables
- Sidebar: gold display, class resources (spell slots, Lay on Hands, Second Wind), consumables
- Rest processing: Short rest recovers Action Surge and 1 Second Wind; Long rest fully restores HP, abilities, and spell slots
- Roll state fix: RollBox keys include scene ID to prevent state persistence between scenes
- Companion label stripping: "IF X IS IN YOUR PARTY" headers hidden; content shown silently when companion present
- Journey Summary: ending scenes show full character sheet summary with order, companions, inventory, and decisions
- 15 combat encounters, 4 shops, 6 side quests written in markdown
- All 198 markdown scenes synced to HTML (223 total with HTML-only companion/Paladin subscenes)
- Creator credit and copyright notice on title screen

### Previous (Untracked)
- Core game engine: React-based choose-your-own-adventure with D&D 5e 2024 rules
- Character creation: Fighter and Paladin classes, standard array, feat selection, weapon mastery
- 9 romanceable companions with spark/flame/oath progression
- Solamnic Order tracking: Rose, Sword, Crown point system
- Paladin divine guidance track and Measure track for Fighters
- Save/load system with 3 slots
- Print-friendly character sheet
