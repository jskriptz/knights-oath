#!/usr/bin/env node
/**
 * Master Audit Script — Runs all audit checks
 * Run: node scripts/audit-all.js [--warnings] [--detail] [--fix]
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

const SCRIPTS_DIR = __dirname;

const audits = [
  { name: 'Structural', script: 'audit-scenes.js', critical: true },
  { name: 'Companions', script: 'audit-companions.js', critical: true },
  { name: 'Romance', script: 'audit-romance.js', critical: false },
  { name: 'Balance', script: 'audit-balance.js', critical: false },
  { name: 'Combat', script: 'audit-combat.js', critical: true },
  { name: 'Reachability', script: 'audit-reachability.js', critical: false }
];

const args = process.argv.slice(2);
const showWarnings = args.includes('--warnings');
const showDetail = args.includes('--detail');
const runSpecific = args.find(a => !a.startsWith('--'));

console.log('╔════════════════════════════════════════════╗');
console.log('║        KNIGHTS OATH — SCENE AUDIT          ║');
console.log('╚════════════════════════════════════════════╝\n');

const results = [];
let hasErrors = false;
let totalErrors = 0;
let totalWarnings = 0;

// Run each audit
for (const audit of audits) {
  if (runSpecific && !audit.name.toLowerCase().includes(runSpecific.toLowerCase())) {
    continue;
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Running ${audit.name} audit...`);
  console.log('─'.repeat(50));

  const scriptPath = path.join(SCRIPTS_DIR, audit.script);
  const cmdArgs = [];
  if (showWarnings) cmdArgs.push('--warnings');
  if (showDetail) cmdArgs.push('--detail');

  try {
    const output = execSync(`node "${scriptPath}" ${cmdArgs.join(' ')}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(output);

    // Parse summary from output
    const errorMatch = output.match(/Errors:\s*(\d+)/);
    const warnMatch = output.match(/Warnings:\s*(\d+)/);
    const errors = errorMatch ? parseInt(errorMatch[1]) : 0;
    const warnings = warnMatch ? parseInt(warnMatch[1]) : 0;

    results.push({ name: audit.name, errors, warnings, passed: errors === 0 });
    totalErrors += errors;
    totalWarnings += warnings;

    if (errors > 0 && audit.critical) {
      hasErrors = true;
    }
  } catch (err) {
    // Script returned non-zero (has errors)
    const output = err.stdout || err.message;
    console.log(output);

    const errorMatch = output.match(/Errors:\s*(\d+)/);
    const warnMatch = output.match(/Warnings:\s*(\d+)/);
    const errors = errorMatch ? parseInt(errorMatch[1]) : 1;
    const warnings = warnMatch ? parseInt(warnMatch[1]) : 0;

    results.push({ name: audit.name, errors, warnings, passed: false });
    totalErrors += errors;
    totalWarnings += warnings;

    if (audit.critical) {
      hasErrors = true;
    }
  }
}

// Final summary
console.log('\n' + '═'.repeat(50));
console.log('                 FINAL SUMMARY');
console.log('═'.repeat(50) + '\n');

const passSymbol = '✓';
const failSymbol = '✗';

for (const result of results) {
  const symbol = result.passed ? passSymbol : failSymbol;
  const color = result.passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  console.log(`  ${color}${symbol}${reset} ${result.name.padEnd(15)} Errors: ${result.errors.toString().padStart(3)}  Warnings: ${result.warnings.toString().padStart(3)}`);
}

console.log('\n' + '─'.repeat(50));
console.log(`  TOTAL: ${totalErrors} errors, ${totalWarnings} warnings`);
console.log('─'.repeat(50));

if (hasErrors) {
  console.log('\n\x1b[31m  AUDIT FAILED — Critical errors found\x1b[0m\n');
  process.exit(1);
} else if (totalErrors > 0) {
  console.log('\n\x1b[33m  AUDIT PASSED with non-critical errors\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\n\x1b[32m  AUDIT PASSED — All checks OK\x1b[0m\n');
  process.exit(0);
}
