import { analyzePreHolyF6Stages } from '../src/analyzer/pre-holy-stage-proof.js';

function numberFlag(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const value = Number(arg.slice(prefix.length));
  if (!Number.isFinite(value)) throw new Error(`Invalid --${name} value.`);
  return Math.trunc(value);
}

const json = process.argv.includes('--json');
const maxExpanded = numberFlag('max-expanded', 25_000);
const maxGenerated = numberFlag('max-generated', 250_000);

const report = analyzePreHolyF6Stages({ maxExpanded, maxGenerated });
if (json) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`PRE_HOLY_F6 interpretation=${report.interpretation}`);
  for (const stage of [report.preBoss, report.core6]) {
    const final = stage.authoritativeReplay?.final ?? stage.certificate?.final ?? {};
    console.log([
      stage.stage,
      `reached=${stage.reached}`,
      `exact=${stage.exact}`,
      `stop=${stage.stoppedReason ?? 'none'}`,
      `expanded=${stage.solver.expandedStates}`,
      `generated=${stage.solver.generatedStates}`,
      `floor=${final.floor ?? 'n/a'}`,
      `cores=${final.cores ?? 'n/a'}`,
      `hp=${final.stats?.hp ?? final.hp ?? 'n/a'}`,
      `atk=${final.stats?.atk ?? final.atk ?? 'n/a'}`,
      `def=${final.stats?.def ?? final.def ?? 'n/a'}`
    ].join(' | '));
  }
}
