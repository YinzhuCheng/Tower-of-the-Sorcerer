import { replayTowerCertificate } from '../solver/replay.js';
import { solve } from '../solver/search.js';
import { createPreHolyStageAdapter } from '../solver/pre-holy-stage-adapter.js';

function runStage(stage, { maxExpanded, maxGenerated }) {
  const adapter = createPreHolyStageAdapter({ stage });
  const solver = solve({
    adapter,
    mode: 'existence',
    maxExpanded,
    maxGenerated
  });
  const certificate = solver.certificate;
  const replay = certificate
    ? replayTowerCertificate(certificate, { adapter })
    : null;
  const verified = solver.solvable === true && replay?.ok === true;

  return {
    stage,
    reached: verified,
    exact: solver.exact,
    stoppedReason: solver.stoppedReason,
    solver: {
      solvable: solver.solvable,
      exact: solver.exact,
      expandedStates: solver.expandedStates,
      generatedStates: solver.generatedStates,
      structuralStates: solver.structuralStates,
      activeLabels: solver.activeLabels,
      prunedDominated: solver.prunedDominated,
      profile: solver.profile
    },
    certificate: certificate ? {
      certificateHash: certificate.certificateHash,
      steps: certificate.steps.length,
      objective: certificate.objective,
      final: certificate.final
    } : null,
    authoritativeReplay: replay ? {
      ok: replay.ok,
      failures: replay.failures,
      objective: replay.objective,
      final: replay.final
    } : null
  };
}

/**
 * Diagnoses the common prefix shared by all delayed-Holy policies.
 *
 * `preBoss` = can reach a state where astralBoss is currently a legal/winnable
 * combat action without ever taking Holy.
 * `core6` = can actually defeat astralBoss and obtain the sixth core without
 * ever taking Holy.
 */
export function analyzePreHolyF6Stages({
  maxExpanded = 25_000,
  maxGenerated = 250_000
} = {}) {
  const preBoss = runStage('preBoss', { maxExpanded, maxGenerated });
  const core6 = runStage('core6', { maxExpanded, maxGenerated });
  const consistency = {
    core6WithoutPreBoss: core6.reached && !preBoss.reached,
    replayVerified: [preBoss, core6]
      .filter((entry) => entry.certificate)
      .every((entry) => entry.authoritativeReplay?.ok === true)
  };

  let interpretation;
  if (core6.reached) {
    interpretation = 'sixth_core_reachable_without_holy';
  } else if (preBoss.reached) {
    interpretation = core6.exact
      ? 'boss_winnable_state_reachable_but_core6_transition_not_reached_exact'
      : 'boss_winnable_state_reachable_core6_search_incomplete';
  } else if (preBoss.exact && preBoss.solver.solvable === false) {
    interpretation = 'astral_boss_cannot_become_winnable_without_holy_exact';
  } else {
    interpretation = 'pre_holy_f6_reachability_unknown_within_budget';
  }

  return {
    schemaVersion: 1,
    model: 'pre-holy-f6-stage-proof-v0.1',
    canonicalBalance: true,
    maxExpanded,
    maxGenerated,
    preBoss,
    core6,
    consistency,
    interpretation
  };
}
