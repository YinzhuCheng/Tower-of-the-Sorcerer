import { scoreTowerCodesignCandidate } from './prunability-score.js';

function defaultKey(candidate) {
  return JSON.stringify(candidate);
}

function rankEvaluated(entries) {
  return [...entries].sort((a, b) => a.score.score - b.score.score
    || String(a.key).localeCompare(String(b.key)));
}

/**
 * Heuristic SETTER-side search over tower variants.
 *
 * `expand(candidate, round)` returns local tower mutations.
 * `evaluate(candidate, round)` may use approximate / bounded player search and
 * returns the inputs expected by scoreTowerCodesignCandidate(). A replay-verified
 * solvability witness is the only hard generation gate. Nothing returned by this
 * function is a proof or a production-ready balance write.
 *
 * Expensive exact/sound validation should run only on the small final portfolio.
 */
export function runTowerCodesignBeamSearch({
  seeds = [],
  expand,
  evaluate,
  keyOf = defaultKey,
  beamWidth = 8,
  rounds = 6,
  scoreOptions = {}
} = {}) {
  if (!Array.isArray(seeds) || seeds.length === 0) throw new Error('codesign beam search requires seed candidates.');
  if (typeof expand !== 'function') throw new Error('codesign beam search requires expand(candidate, round).');
  if (typeof evaluate !== 'function') throw new Error('codesign beam search requires evaluate(candidate, round).');
  if (typeof keyOf !== 'function') throw new Error('keyOf must be a function.');
  if (!Number.isInteger(beamWidth) || beamWidth < 1) throw new Error('beamWidth must be positive.');
  if (!Number.isInteger(rounds) || rounds < 0) throw new Error('rounds must be non-negative.');

  const seen = new Map();
  const history = [];

  function evaluateOne(candidate, round, parentKey = null) {
    const key = keyOf(candidate);
    const prior = seen.get(key);
    if (prior) return prior;
    const evaluation = evaluate(candidate, round);
    const score = scoreTowerCodesignCandidate(evaluation, scoreOptions);
    const entry = { candidate, key, parentKey, round, evaluation, score };
    seen.set(key, entry);
    return entry;
  }

  let beam = rankEvaluated(seeds.map((candidate) => evaluateOne(candidate, 0)))
    .filter((entry) => Number.isFinite(entry.score.score))
    .slice(0, beamWidth);
  history.push({ round: 0, evaluated: seeds.length, beam: beam.map((entry) => entry.key) });

  for (let round = 1; round <= rounds && beam.length > 0; round += 1) {
    const pool = [...beam];
    let generated = 0;
    for (const parent of beam) {
      const neighbors = expand(parent.candidate, round) ?? [];
      for (const candidate of neighbors) {
        generated += 1;
        pool.push(evaluateOne(candidate, round, parent.key));
      }
    }
    const unique = [...new Map(pool.map((entry) => [entry.key, entry])).values()];
    beam = rankEvaluated(unique)
      .filter((entry) => Number.isFinite(entry.score.score))
      .slice(0, beamWidth);
    history.push({ round, generated, unique: unique.length, beam: beam.map((entry) => entry.key) });
  }

  return {
    schemaVersion: 1,
    model: 'tower-solver-codesign-beam-v0.1',
    heuristicOnly: true,
    productionWriteAllowed: false,
    beamWidth,
    rounds,
    evaluatedCandidates: seen.size,
    history,
    portfolio: rankEvaluated(beam),
    best: rankEvaluated(beam)[0] ?? null
  };
}
