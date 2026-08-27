import { screenNumericLevers } from '../src/tuner/numeric-sensitivity-screen.js';

function readNumberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const value = Number(arg.slice(prefix.length));
  if (!Number.isFinite(value)) throw new Error(`Invalid --${name} value.`);
  return value;
}

const json = process.argv.includes('--json');
const topK = readNumberFlag('top-k', 16);
const relativeStep = readNumberFlag('relative-step', 0.10);

const report = screenNumericLevers({
  staticTopK: Math.trunc(topK),
  probeRelativeStep: relativeStep
});

if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log('Numeric lever screen');
  console.log(`catalogue=${report.catalogueSize} probed=${report.probes.length} baselineMargin=${report.baseline.minNormalizedHpMargin}`);
  for (const [index, probe] of report.probes.entries()) {
    const mutation = probe.mutation;
    const line = [
      `${String(index + 1).padStart(2, ' ')}. ${probe.parameter.key}`,
      mutation ? `${mutation.baseline} -> ${mutation.value}` : 'bound',
      probe.cliffAtProbe ? 'CLIFF' : `margin=${probe.mutated?.minNormalizedHpMargin ?? 'n/a'}`,
      `screen=${Number.isFinite(probe.screenScore) ? probe.screenScore.toFixed(4) : '-inf'}`,
      `trace=${probe.traceScore.toFixed(4)}`
    ];
    console.log(line.join(' | '));
  }
}
