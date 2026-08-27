export const DEMO10_SIMPLE_BUILD_PORTFOLIO = Object.freeze([
  Object.freeze(['def', 'atk', 'hp']),
  Object.freeze(['atk', 'def', 'hp']),
  Object.freeze(['def', 'hp', 'atk']),
  Object.freeze(['atk', 'hp', 'def']),
  Object.freeze(['hp', 'def', 'atk']),
  Object.freeze(['hp', 'atk', 'def'])
]);

// Historical v1 quality band: intentionally allowed two simple builds to fail
// in order to preserve a sharper strategic boundary. Keep it for diagnostics
// and later hard-mode work.
export const DEMO10_QUALITY_TARGETS = Object.freeze({
  minSolvableBuilds: 4,
  maxSolvableBuilds: 5,
  bestBuildMarginMin: 0.15,
  bestBuildMarginMax: 0.50,
  weakestWinningMarginMin: 0.05,
  minTerminalHpSpread: 900,
  lateFloors: Object.freeze([8, 9, 10]),
  f9ShopCoverageMin: 0.75,
  lateFloorPressureMax: 0.60
});

// Playable-first development band: the current product milestone values broad
// human playability above a narrow difficulty optimum. All six recurring build
// orders should be able to finish; pressure is still bounded so the late game
// cannot become completely inert. This is a demo-generation target, not an
// exact global balance claim.
export const DEMO10_PLAYABILITY_TARGETS = Object.freeze({
  minSolvableBuilds: 6,
  maxSolvableBuilds: 6,
  bestBuildMarginMin: 0.02,
  bestBuildMarginMax: 0.85,
  weakestWinningMarginMin: 0.01,
  minTerminalHpSpread: 0,
  lateFloors: Object.freeze([8, 9, 10]),
  f9ShopCoverageMin: 0.75,
  lateFloorPressureMax: 0.85
});

function finiteMin(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? Math.min(...finite) : null;
}

function finiteMax(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? Math.max(...finite) : null;
}

function finiteMean(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}

function round(value, digits = 4) {
  if (!Number.isFinite(value)) return value;
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function summarizeReportFloor(report, floor) {
  const battles = report.battleLog.filter((entry) => entry.floor === floor);
  const bosses = battles.filter((entry) => entry.boss || entry.finalBoss);
  const purchases = report.purchaseLog.filter((entry) => entry.floor === floor);
  return {
    floor,
    battles: battles.length,
    bossBattles: bosses.length,
    minMargin: finiteMin(battles.map((entry) => entry.normalizedHpMargin)),
    bossMinMargin: finiteMin(bosses.map((entry) => entry.normalizedHpMargin)),
    totalDamage: battles.reduce((sum, entry) => sum + (entry.battle?.totalDamage ?? 0), 0),
    goldGain: battles.reduce((sum, entry) => sum + (entry.goldGain ?? 0), 0),
    purchases: purchases.length,
    purchaseOptions: purchases.map((entry) => entry.optionId)
  };
}

function aggregateFloor(floor, winningReports) {
  const samples = winningReports.map((report) => summarizeReportFloor(report, floor));
  return {
    floor,
    sampledBuilds: samples.length,
    buildsWithBattles: samples.filter((sample) => sample.battles > 0).length,
    buildsWithBossBattle: samples.filter((sample) => sample.bossBattles > 0).length,
    buildsWithPurchases: samples.filter((sample) => sample.purchases > 0).length,
    minMargin: round(finiteMin(samples.map((sample) => sample.minMargin))),
    meanMinMargin: round(finiteMean(samples.map((sample) => sample.minMargin))),
    maxMinMargin: round(finiteMax(samples.map((sample) => sample.minMargin))),
    bossMinMargin: round(finiteMin(samples.map((sample) => sample.bossMinMargin))),
    meanBossMinMargin: round(finiteMean(samples.map((sample) => sample.bossMinMargin))),
    maxBossMinMargin: round(finiteMax(samples.map((sample) => sample.bossMinMargin))),
    totalDamageRange: [
      Math.min(...samples.map((sample) => sample.totalDamage)),
      Math.max(...samples.map((sample) => sample.totalDamage))
    ],
    purchaseCountRange: [
      Math.min(...samples.map((sample) => sample.purchases)),
      Math.max(...samples.map((sample) => sample.purchases))
    ],
    samples
  };
}

export function summarizeDemoTenFloorPortfolio(reports, targets = DEMO10_QUALITY_TARGETS) {
  if (!Array.isArray(reports) || reports.length === 0) {
    throw new Error('10F portfolio summary requires at least one report.');
  }

  const winningReports = reports.filter((report) => report.solvable);
  const winningByHp = [...winningReports].sort((a, b) => b.final.hp - a.final.hp);
  const winner = winningByHp[0] ?? null;
  const weakestWinningReport = [...winningReports]
    .sort((a, b) => (a.minNormalizedHpMargin ?? Infinity) - (b.minNormalizedHpMargin ?? Infinity))[0] ?? null;
  const weakestTerminalReport = winningByHp.at(-1) ?? null;
  const terminalHpSpread = winner && weakestTerminalReport ? winner.final.hp - weakestTerminalReport.final.hp : null;
  const lateFloors = Object.fromEntries(
    targets.lateFloors.map((floor) => [floor, aggregateFloor(floor, winningReports)])
  );
  const f9ShopCoverage = winningReports.length
    ? lateFloors[9].buildsWithPurchases / winningReports.length
    : 0;

  const violations = [];
  if (winningReports.length < targets.minSolvableBuilds) {
    violations.push(`solvable-builds-below-min:${winningReports.length}<${targets.minSolvableBuilds}`);
  }
  if (winningReports.length > targets.maxSolvableBuilds) {
    violations.push(`solvable-builds-above-max:${winningReports.length}>${targets.maxSolvableBuilds}`);
  }
  if (!winner || !Number.isFinite(winner.minNormalizedHpMargin)) {
    violations.push('missing-best-winning-margin');
  } else {
    if (winner.minNormalizedHpMargin < targets.bestBuildMarginMin) {
      violations.push(`best-build-too-brittle:${round(winner.minNormalizedHpMargin)}`);
    }
    if (winner.minNormalizedHpMargin > targets.bestBuildMarginMax) {
      violations.push(`best-build-too-forgiving:${round(winner.minNormalizedHpMargin)}`);
    }
  }
  if (!weakestWinningReport || !Number.isFinite(weakestWinningReport.minNormalizedHpMargin)) {
    violations.push('missing-weakest-winning-margin');
  } else if (weakestWinningReport.minNormalizedHpMargin < targets.weakestWinningMarginMin) {
    violations.push(`weakest-win-too-brittle:${round(weakestWinningReport.minNormalizedHpMargin)}`);
  }
  if (!Number.isFinite(terminalHpSpread) || terminalHpSpread < targets.minTerminalHpSpread) {
    violations.push(`terminal-hp-spread-too-small:${terminalHpSpread ?? 'null'}`);
  }
  if (f9ShopCoverage < targets.f9ShopCoverageMin) {
    violations.push(`f9-shop-coverage-too-low:${round(f9ShopCoverage)}`);
  }

  for (const floor of targets.lateFloors) {
    const profile = lateFloors[floor];
    if (profile.buildsWithBattles !== winningReports.length) {
      violations.push(`f${floor}-missing-battle-coverage:${profile.buildsWithBattles}/${winningReports.length}`);
    }
    if (profile.buildsWithBossBattle !== winningReports.length) {
      violations.push(`f${floor}-missing-boss-coverage:${profile.buildsWithBossBattle}/${winningReports.length}`);
    }
    if (Number.isFinite(profile.meanMinMargin) && profile.meanMinMargin > targets.lateFloorPressureMax) {
      violations.push(`f${floor}-too-forgiving:${profile.meanMinMargin}`);
    }
  }

  return {
    testedBuilds: reports.length,
    solvableBuilds: winningReports.length,
    failedBuilds: reports.length - winningReports.length,
    winner,
    weakestWinningReport,
    weakestTerminalReport,
    terminalHpSpread,
    f9ShopCoverage: round(f9ShopCoverage),
    lateFloors,
    violations,
    reports
  };
}

export function demoTenFloorQualityLoss(summary, targets = DEMO10_QUALITY_TARGETS) {
  const winnerMargin = summary.winner?.minNormalizedHpMargin;
  const weakestMargin = summary.weakestWinningReport?.minNormalizedHpMargin;
  const f8Boss = summary.lateFloors?.[8]?.meanBossMinMargin;
  const f9Boss = summary.lateFloors?.[9]?.meanBossMinMargin;
  const hardPenalty = summary.violations.length * 1000;

  return hardPenalty
    + Math.abs(summary.solvableBuilds - 4.5) * 8
    + (Number.isFinite(winnerMargin) ? Math.abs(winnerMargin - 0.28) * 20 : 100)
    + (Number.isFinite(weakestMargin) ? Math.abs(weakestMargin - 0.10) * 12 : 100)
    + (Number.isFinite(f8Boss) ? Math.abs(f8Boss - 0.34) * 5 : 25)
    + (Number.isFinite(f9Boss) ? Math.abs(f9Boss - 0.20) * 8 : 25)
    + Math.max(0, targets.minTerminalHpSpread - (summary.terminalHpSpread ?? 0)) / 100;
}

export function demoTenFloorPlayabilityLoss(summary, targets = DEMO10_PLAYABILITY_TARGETS) {
  const weakestMargin = summary.weakestWinningReport?.minNormalizedHpMargin;
  const missingBuilds = Math.max(0, targets.minSolvableBuilds - summary.solvableBuilds);
  const hardPenalty = summary.violations.length * 1000;
  return hardPenalty
    + missingBuilds * 10_000
    + (Number.isFinite(weakestMargin) ? Math.abs(weakestMargin - 0.08) * 100 : 500)
    + Math.max(0, targets.f9ShopCoverageMin - (summary.f9ShopCoverage ?? 0)) * 500;
}
