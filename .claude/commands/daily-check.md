# Daily Health Check
Run once per day.

## Task
You are ko-orchestrator. Perform a full project health check:
- Read CLAUDE.md and verify line ranges still roughly match index.html
- Check if any SECURITY-ALERT.md or TEST-ALERT.md files exist and summarize them
- Check CDN versions in index.html against latest stable (React, fonts)
- Verify campaigns/ folder has expected 14 JSON files
- Verify www/ matches source files (run npm run sync --dry-run if possible)

## Output
Write a daily report to .claude-flow/logs/daily-YYYY-MM-DD.md
Alert via HANDOFF.md only if something needs attention.
