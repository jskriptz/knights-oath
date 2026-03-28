# Auto Test Run
Run after security passes.

## Task
You are ko-tester. Verify:
- index.html has no syntax errors
- All scene choices lead to valid scene IDs (spot check 10 random scenes)
- Save system functions exist and are unchanged: saveGame, loadAllSlots, deleteSave
- npm run sync completes without errors
- Version string exists in loading screen

## Output
Append a timestamped test report to HANDOFF.md.
If all pass — no action needed.
If any fail — create a file called TEST-ALERT.md describing failures.
