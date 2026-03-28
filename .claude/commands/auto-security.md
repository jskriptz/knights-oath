# Auto Security Scan
Run after any edit to index.html, sw.js, or manifest.json.

## Task
You are ko-security. Scan the recently changed files for:
- XSS vectors in any new scene text or UI components
- Save system integrity (no format changes without migration)
- New dependencies added without approval
- Permissions changes in AndroidManifest.xml
- Service worker scope changes

## Output
Append a timestamped security note to HANDOFF.md.
If PASS — no action needed.
If FAIL — create a file called SECURITY-ALERT.md describing the issue.
