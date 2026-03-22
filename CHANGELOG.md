# Changelog

All notable changes to **Dragonlance: The Knight's Oath** are documented here.

## v22.0.1 — 2026-03-22

### Combat Companion Action Overhaul
- Companion buff actions now mechanically affect combat: Shield Wall (+AC), Flank/Mark (+attack), Distraction (enemy -1), Encourage (+1 all)
- Enemy attacks factor in `acBuff` and `enemyDebuff` from companion actions
- Buffs reset each round (no permanent stacking)
- "Get civilians to safety" removes companion from combat but they rejoin party after (+10 XP bonus)
- Vael's "Honest Assessment" reveals enemy HP values (hidden by default)
- Guard action (Lysander) redirects enemy attacks to guardian
- Bandage/stabilize actions restore unconscious companions
- Round header no longer shows max rounds (combat is unlimited)
- Pen & Paper mode Victory/Defeat buttons now apply rewards, loss consequences, and combat-resolved flag
- Rescued companions shown in green on combat end, not listed as dead

## v22.0.0 — 2026-03-22

### Combat System Fixes
- Default companion actions generated from stats when scene text lacks them (5 COMBAT ENCOUNTER scenes)
- Parser recognizes `Rewards:` lines — extracts XP, gold, and inventory items
- Combat rewards (XP, gold, items) now applied to game state on victory
- Loss consequences: HP set to 1, exhaustion counter incremented on defeat
- Bonus action abilities (Second Wind, Lay on Hands, Potion, Smite) now auto-advance turn phase
- Victory and Fallen narrative text added to all 15 combat scenes
- Scene 26 rewards fixed: 60 XP total (was "15 XP per draconian"), sealed dispatch pouch added to inventory

### Loot & Inventory
- LootBox now adds items to inventory (Potions of Healing, named items, rations)
- Rare item roll (nat 20) awards +1 Weapon or +1 Armor to magic items
- Fixed `ADD TO INVENTORY` regex — items like Dragon Army Patrol Sketch and Mira's Travel Bundle now properly added
- Combat reward items (Sealed orders, Sealed dispatch pouch) marked with `(inventory item)` tag

### Romance System
- Fixed case-sensitive companion name matching — was broken for all uppercase scene titles
- Added explicit `romance_comp` field to 29 romance choices where title/text matching failed
- All 51 romance-tagged choices now correctly resolve to their companion (was 0/51 before)

### Forge (Scene 35)
- Three new response scenes: 35A (The Insignia, +1 ROSE), 35B (Blade Work, +1 SWORD), 35C (Respect, +1 CROWN)
- Forge choices no longer dump back to hub with no payoff

### Ending / Journey Summary
- Epilogue scenes (72–80) rerouted through Scene 71 hub instead of linear chain
- Epilogues now only shown for companions in your party
- Already-visited epilogues hidden from Scene 71
- Scene 71 prose filtered by player's Solamnic Order (Rose/Sword/Crown)
- Scene 80 dead end fixed (was routing to nonexistent "END" scene)

### Scenes
- Total scenes: 220 (up from 217)

## v21.0.1 — 2026-03-22

### Romance in Combat
- Romanced companions show pink HP bars instead of blue in combat
- Pink left border on companion action blocks during their turn
- 27 unique narrative romance tooltips (9 companions × 3 levels: Spark, Flame, Oath)
- Heart icon (♡) next to romanced companion names in combat and sidebar
- Hover any romanced companion to see a character-specific romance line

## v21.0.0 — 2026-03-22

### Combat System Rework — D&D 5e 2024 Tabletop Rules
- Complete CombatBox rewrite: true 5e turn-based combat (Action → Bonus Action → Action Surge)
- Enemies roll d20 + attack bonus vs player AC (no more "defense rolls")
- Target selection by zone: close (5ft), mid (10-30ft), far (60+ft) — filtered by weapon range
- Weapon swap during combat (free object interaction, 1/turn)
- All 8 weapon masteries implemented: Sap, Graze, Topple, Vex, Cleave, Nick, Push, Slow
- Companion HP, AC, and attack stats — companions can take damage and fall
- Companion death saves (d20 vs DC 10) — permanent death if not stabilized
- Player death saves when unconscious; companions fight on if alive
- Game over if player dies with no living companions
- Status conditions with icons: Prone, Sapped, Slowed, Blessed, Concentrating, Dodging, Unconscious, Vexed
- Concentration tracking with CON saves on damage
- Bless spell: +1d4 to attacks and saves (concentration)
- Cure Wounds: 2d8+CHA healing (replaces attack action)
- Enemy targeting: 60% player / 40% companion, with Caeron aggro and Lysander guard overrides
- Advantage/disadvantage on attacks (Vex, Prone, Dodge)
- Critical hits (nat 20 = double damage dice)
- Companion stat blocks: all 9 companions with AC, HP, attacks
- Pen & Paper mode: stat blocks + Win/Lose outcome buttons

### Bug Fixes
- Hub choices no longer repeatable after visiting (visit-based hiding)
- Roll boxes persist results via `completedRolls` — no re-rolling on revisit
- Armoury buyback: full refund for items bought this visit, half price for pre-owned
- Combat companion names resolved to actual party members

## v20.0.0 — 2026-03-22

### Scene 4A: Aldous's Parting Advice
- New transition scene between Scene 4 and the morning hub
- Aldous gives parting wisdom about the Measure before sending you into the morning

### Hub Display
- Hub scene headers no longer show numeric prefixes (e.g., "Scene HUB" instead of "Scene 1_HUB")

### Visit-Based Choice Hiding
- Hub choices for already-visited scenes are now hidden instead of showing "(If not yet visited)"
- Applies to 1_HUB and 53_HUB hub scenes
- "(If not yet visited)" prefix stripped from remaining visible choices

## v19.1.2 — 2026-03-22

### Cleanup
- Removed 7 orphaned scenes with zero references: `DATE_WALK`, `DATE_SPAR`, `DATE_QUIET`, `REST_ROMANCE`, `REST_COMPATIBLE`, `REST_CONFRONT`, `REST_SWITCH`
- REST scenes preserved in markdown as unimplemented design notes
- Total scenes: 216 (down from 223)

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
