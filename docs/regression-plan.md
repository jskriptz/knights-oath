# Knights Oath — Regression Test Plan

## Overview
Manual regression checklist for verifying core functionality after code changes. Run through critical paths before each release.

---

## 1. Campaign Loading & Boot

### 1.1 Fresh Load
- [ ] Game loads without console errors
- [ ] Loading screen shows correct version (v25.12.0)
- [ ] Loading screen shows "350 Scenes • 9 Companions"
- [ ] "READY" indicator appears after scenes load
- [ ] Theme CSS variables applied (gold accents, dark background)

### 1.2 Save Slots
- [ ] Empty slots show "— Empty —"
- [ ] Existing saves display name, level, class, scene
- [ ] Delete confirmation works (Yes/No)
- [ ] Load existing save restores full state

---

## 2. Character Creation

### 2.1 Class Selection
- [ ] Fighter available with correct description
- [ ] Paladin available with correct description
- [ ] Class-specific skills display correctly

### 2.2 Stat Assignment
- [ ] Standard Array method works
- [ ] Point Buy method tracks 27 points correctly
- [ ] Roll (4d6 drop lowest) animates and records
- [ ] Racial bonuses (+2/+1) apply correctly

### 2.3 Equipment & Feats
- [ ] Starting weapon selection works
- [ ] Starting armor selection works
- [ ] Shield toggle works
- [ ] Fighting Style selection (Fighter)
- [ ] Feat selection (if applicable)
- [ ] Weapon Mastery selection (2 weapons)

### 2.4 Completion
- [ ] Name entry works
- [ ] Quick Start presets load correctly
- [ ] "Begin Adventure" creates valid game state
- [ ] Starting inventory matches campaign.json

---

## 3. Scene Navigation

### 3.1 Basic Navigation
- [ ] Scene 1 loads as start scene
- [ ] Choices display with correct letters (A, B, C...)
- [ ] Clicking choice navigates to target scene
- [ ] History records "SceneID: Choice Text"
- [ ] Back navigation disabled (no browser back issues)

### 3.2 Scene Filtering
- [ ] Class-specific choices hidden for other class
- [ ] Flag-gated choices appear only when flag set
- [ ] Companion-gated choices require companion in party
- [ ] Hub visit-gating works (can't skip ahead)

### 3.3 Mandatory Detours
- [ ] Paladin detours (P1, DG1) appear when conditions met
- [ ] Detour completion allows normal navigation
- [ ] Detour choices set correct flags

### 3.4 Scene Types
- [ ] Prose scenes render markdown correctly
- [ ] Combat scenes trigger CombatBox
- [ ] Shop scenes trigger ShopBox
- [ ] Roll scenes trigger RollBox
- [ ] Loot scenes trigger LootBox

---

## 4. Combat System

### 4.1 Initiative & Setup
- [ ] Combat box appears with enemy stats
- [ ] Initiative rolled for all participants
- [ ] Turn order displays correctly
- [ ] Companion positions shown

### 4.2 Player Actions
- [ ] Attack rolls d20 + modifiers
- [ ] Damage applies to target HP
- [ ] Critical hits (nat 20) double damage dice
- [ ] Miss on nat 1 regardless of modifiers
- [ ] Second Wind heals (Fighter)
- [ ] Action Surge grants extra action (Fighter)
- [ ] Lay on Hands pool available (Paladin)
- [ ] Spell casting works (Paladin)

### 4.3 Weapon Masteries
- [ ] Cleave triggers on kill (extra attack)
- [ ] Graze deals STR mod on miss
- [ ] Vex grants advantage on next attack
- [ ] Push moves target 10 ft
- [ ] Topple knocks prone on failed save
- [ ] Sap imposes disadvantage
- [ ] Slow reduces speed by 10 ft
- [ ] Nick allows extra light weapon attack

### 4.4 Companion Actions
- [ ] Companions take turns in initiative order
- [ ] Companion abilities trigger (flank, heal, etc.)
- [ ] Companion HP tracks separately
- [ ] Unconscious companions make death saves

### 4.5 Combat Resolution
- [ ] Victory when all enemies at 0 HP
- [ ] Defeat triggers death save sequence
- [ ] Equipment degradation on defeat (weapon 2-4, armor 1-3)
- [ ] Loot box appears on victory (non-noLoot scenes)
- [ ] Combat narration displays appropriately
- [ ] Sound effects play (hit, miss, crit, victory, defeat)

### 4.6 Special Combats
- [ ] Boar fight (11_YARD, 12) — unique mechanics
- [ ] Duel (69) — one-on-one rules
- [ ] Spar (12) — non-lethal

---

## 5. Roll System

### 5.1 Skill Checks
- [ ] DC displayed correctly
- [ ] Relevant skill modifier shown
- [ ] Roll animation plays
- [ ] Result compared to DC
- [ ] Success/Failure text displays
- [ ] Roll marked complete (no re-roll)

### 5.2 Modifiers
- [ ] Proficiency bonus applies
- [ ] Ability modifier applies
- [ ] Advantage/disadvantage handles two dice
- [ ] Bless adds d4 when active
- [ ] Exhaustion penalty applies

---

## 6. Shop System

### 6.1 Buying
- [ ] Items display with prices
- [ ] Gold deducted on purchase
- [ ] Item added to inventory
- [ ] Cannot buy if insufficient gold
- [ ] Equipment auto-equips to correct slot

### 6.2 Selling
- [ ] SELL_PRICES apply correctly
- [ ] UNSELLABLE items cannot be sold
- [ ] Gold added on sale
- [ ] Item removed from inventory/equipment

---

## 7. Companion System

### 7.1 Joining/Leaving
- [ ] Companion joins when scene conditions met
- [ ] Companion appears in sidebar
- [ ] Companion tag shows in scene view
- [ ] Scene effects trigger departure when flagged

### 7.2 Approval
- [ ] Approval delta applies from choices
- [ ] Approval bar updates in sidebar
- [ ] Labels update (Hostile → Wary → Neutral → Trusted → Devoted)
- [ ] Color coding matches approval level
- [ ] Toast notifications show approval changes

### 7.3 Gifts
- [ ] Max approval triggers gift scene
- [ ] Gift grants skill bonus
- [ ] Gift recorded in companionGifts

---

## 8. Romance System

### 8.1 Sparks & Flames
- [ ] romance_spark sets initial interest
- [ ] romance_flame advances relationship
- [ ] Romance status shows in companion tag (heart icon)
- [ ] Romance-exclusive scenes filter correctly

### 8.2 Relationship Checks
- [ ] Scenes 53, 61, 68 trigger relationship check
- [ ] Check evaluates approval + romance state
- [ ] Breakup triggers for negative outcomes
- [ ] Romance oath scenes work at max approval

### 8.3 Romance Compatibility
- [ ] Each companion has correct romance requirements
- [ ] Incompatible romances don't progress
- [ ] Multiple romances handled (max active)

---

## 9. Point Systems

### 9.1 Order Points
- [ ] ROSE points accumulate correctly
- [ ] SWORD points accumulate correctly
- [ ] CROWN points accumulate correctly
- [ ] Max order tracked for ending calculation

### 9.2 Honour
- [ ] Honour gains apply (+1, +2)
- [ ] Honour losses apply (-1, -2, -3)
- [ ] Starting honour is 5
- [ ] Honour affects certain choices/outcomes

### 9.3 God Signs (Paladin)
- [ ] Tally marks accumulate per god
- [ ] God sign picker appears at oath selection
- [ ] Highest tally influences oath recommendation

---

## 10. Save System

### 10.1 Saving
- [ ] Save button stores to localStorage
- [ ] Save includes character + progress split
- [ ] saveVersion: 2 in save data
- [ ] Timestamp recorded (savedAt)

### 10.2 Loading
- [ ] v2 saves load correctly
- [ ] v1 legacy saves auto-migrate
- [ ] Derived stats recalculated on load
- [ ] Scene state restored

### 10.3 Export/Import
- [ ] Character export generates JSON file
- [ ] Character import reads JSON file
- [ ] Imported character starts new campaign correctly

---

## 11. UI Components

### 11.1 Sidebar
- [ ] Toggle open/close works
- [ ] HP bar displays correctly
- [ ] Stats show current values
- [ ] Companions list with approval bars
- [ ] Inventory displays items
- [ ] Weight tracking shows encumbrance
- [ ] Quest objectives appear when active

### 11.2 Character Sheet
- [ ] Full stats display
- [ ] Equipment slots functional
- [ ] Equip/unequip works
- [ ] Spell preparation (Paladin)
- [ ] Kill tracker shows combat stats

### 11.3 Modals
- [ ] Defeat recovery modal works
- [ ] Short rest modal (hit dice spending)
- [ ] Level up notification
- [ ] NPC notification (gifts, departures)
- [ ] Confirm modal (yes/no prompts)

### 11.4 Party Banter
- [ ] Banter triggers on appropriate scenes
- [ ] Requires correct companions
- [ ] Displays speaker names and dialogue

---

## 12. Endings

### 12.1 Standard Endings
- [ ] Ending scenes 71-80 reachable
- [ ] Order alignment determines ending variant
- [ ] Companion epilogues display
- [ ] DM Summary generates correctly

### 12.2 Special Endings
- [ ] DISGRACE ending on 0 honour
- [ ] Death endings on failed saves
- [ ] Romance-specific ending variations

---

## 13. Audio

### 13.1 Sound Effects
- [ ] Click sound on UI interactions
- [ ] Roll sound on dice rolls
- [ ] Hit/miss/crit sounds in combat
- [ ] Heal sound on healing
- [ ] Victory/defeat sounds
- [ ] Level up sound
- [ ] Gold sound on currency gain
- [ ] Equip sound on equipment changes

### 13.2 Music (if enabled)
- [ ] Title music plays on cover
- [ ] Ambient music in scenes
- [ ] Combat music triggers
- [ ] Victory/defeat music

---

## 14. Mobile/PWA

### 14.1 Responsive Layout
- [ ] Mobile viewport renders correctly
- [ ] Touch targets are adequate size
- [ ] Sidebar swipe gesture works
- [ ] Text readable without zoom

### 14.2 PWA Features
- [ ] Install prompt appears
- [ ] App installs correctly
- [ ] Offline mode works (after cache)
- [ ] Service worker updates

---

## Quick Smoke Test (5 min)

For rapid verification after minor changes:

1. [ ] Load game — version correct, no console errors
2. [ ] Quick Start Fighter — character created
3. [ ] Scene 1 → choice A — navigation works
4. [ ] Reach combat (11_YARD or 26) — combat loads
5. [ ] Win combat — loot appears, return to scene
6. [ ] Save game — save slot populated
7. [ ] Reload page — load save works
8. [ ] Check sidebar — companions, approval, inventory display

---

## Test Data Scenes

| Scene | Tests |
|-------|-------|
| 1 | Start, class prose filter |
| 8 | Class branching, companion choice |
| 11_YARD | Boar combat, companion actions |
| 12 | Spar combat, honour gain |
| 18 | Serath join, romance spark |
| 27 | Flag setting (dispatch_kept) |
| 31 | Flag-gated choice |
| 44 | Refugee scene, multiple branches |
| 53 | Relationship check trigger |
| 69 | Duel combat |
| 71 | Endings, companion gates |
| BV1-BV3 | Burning village, honour choices |

---

## Audit Scripts

Run before release:
```bash
node scripts/audit-scenes.js      # Scene integrity
node scripts/audit-companions.js  # Companion data
node scripts/audit-combat.js      # Combat narration
node scripts/audit-balance.js     # Point economy
node scripts/audit-romance.js     # Romance paths
node scripts/audit-reachability.js # Scene connectivity
```

All should report **0 errors**.

---

*Last updated: v25.12.0*
