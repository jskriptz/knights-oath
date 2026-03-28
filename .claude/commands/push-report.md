# Push Report Generator
Run after all checks pass on git push.

## Task
Read HANDOFF.md for the latest security and tester results.
Then run these commands and print a formatted report to the terminal:
- git log -1 --oneline (commit info)
- grep for version string in index.html loading screen

Print exactly this to terminal using echo:

```
================================================
  KNIGHTS OATH - PUSH REPORT
  [date and time]
================================================
COMMIT:   [git log -1 --oneline output]
VERSION:  [version from index.html]

SECURITY: [verdict from HANDOFF.md]
TESTS:    [X/X passed from HANDOFF.md]
ALERTS:   None

FILES CHANGED:
[git diff --name-only HEAD~1 output, one per line]

SIGNED OFF:
  ko-security ......... [verdict]
  ko-tester ........... [X/X PASS]
  ko-orchestrator ..... APPROVED
================================================
  PUSHED AND VERIFIED
================================================
```
