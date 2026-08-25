import {
  collectPreHolyF6BoundaryFrontier,
  summarizePreHolyF6BoundaryFrontier
} from '../src/analyzer/pre-holy-boundary-frontier.js';

function readNumber(flag, fallback) {
  const prefix = `--${flag}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
  if (raw == null) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid --${flag}: ${raw}`);
  return value;
}

const report = collectPreHolyF6BoundaryFrontier({
  maxExpanded: readNumber('max-expanded', 25_000),
  maxGenerated: readNumber('max-generated', 250_000)
});
const summary = summarizePreHolyF6BoundaryFrontier(report);

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(summary)}\n`);
} else {
  console.log(JSON.stringify(summary, null, 2));
}
