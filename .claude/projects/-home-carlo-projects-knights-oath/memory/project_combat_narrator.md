---
name: project_combat_narrator
description: Combat narrator system — dynamic DM prose replacing static situation text, plus future equipment degradation
type: project
---

Combat rework: add dynamic DM narrator to each combat scene. The situation prose area updates after every turn with context-aware authored lines based on hit/miss/crit, enemy state, companion actions, etc. All mechanical UI (dice, AC, rolls, log) stays visible alongside the narrator.

**Why:** The static round text never changes — player needs narrative feedback like a DM describing the scene after each action.

**How to apply:** Each combat scene gets a `narration` object with per-scene authored lines keyed by event (playerHit, playerMiss, playerCrit, enemyBloodied, enemyNearDeath, enemyDeath, playerHurt, companionActs, etc.). The situation prose area renders the most recent narration line dynamically.

## Future: Equipment Degradation
- Weapons and armour degrade as player gets hit or blocks
- User must mend or replace at armouries
- At the garrison (Brightholm), upkeep only — the Order helps squires and knights
- Outside the garrison, full repair/replace costs apply

## Future: Combat Scars
- If an enemy hits you, flavour text about scars
- If an enemy downs you (0 HP), you get a lasting scar reference
