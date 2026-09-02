import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist');

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`${label} patch anchor missing: ${before.slice(0, 96)}`);
  return source.replace(before, after);
}

async function applyEngineProductionPatch() {
  const enginePath = join(outDir, 'src', 'game', 'engine.js');
  let source = await readFile(enginePath, 'utf8');

  source = replaceRequired(
    source,
    "export function tryMove(state, dx, dy) {\n",
    "export function prepareBossEncounter(state, dx, dy) {\n  if (!state || state.victory) return null;\n  const parsed = parseToken(getTile(state, state.x + dx, state.y + dy));\n  if (parsed.type !== 'enemy') return null;\n  const enemy = ENEMIES[parsed.id];\n  const dialogue = enemy?.boss ? enemy.preBattleDialogue : null;\n  if (!dialogue || state.storySeen.includes(dialogue)) return null;\n  state.storySeen.push(dialogue);\n  addLog(state, `与「${enemy.name}」对峙。`);\n  return {\n    bossEncounter: true,\n    dialogue,\n    enemyId: parsed.id,\n    enemy,\n    moved: false,\n    blocked: false,\n    events: []\n  };\n}\n\nexport function tryMove(state, dx, dy) {\n",
    'Boss encounter prelude'
  );

  await writeFile(enginePath, source);
}

async function applyProductionCanvasPatch() {
  const scenePath = join(outDir, 'src', 'game', 'anime-canvas-scene.js');
  let source = await readFile(scenePath, 'utf8');
  source = replaceRequired(
    source,
    "import { DIRECTIONS, getTile, parseToken, tryMove } from './engine.js';\n",
    "import { DIRECTIONS, getTile, parseToken, prepareBossEncounter, tryMove } from './engine.js';\n",
    'Production boss prelude import'
  );
  source = replaceRequired(
    source,
    "    // Facing changes even when movement is blocked, matching classic tile RPGs.\n    this.direction = direction;\n    const result = tryMove(this.bridge.getState(), vector.dx, vector.dy);\n",
    "    // Facing changes even when movement is blocked, matching classic tile RPGs.\n    this.direction = direction;\n    const prelude = prepareBossEncounter(this.bridge.getState(), vector.dx, vector.dy);\n    if (prelude) {\n      const result = { ...prelude, resumeDirection: direction };\n      this.bridge.onResult(result);\n      return result;\n    }\n    const result = tryMove(this.bridge.getState(), vector.dx, vector.dy);\n",
    'Production boss prelude'
  );
  await writeFile(scenePath, source);
}

async function applyTacticalInteractionPatch() {
  const interactionPath = join(outDir, 'src', 'game', 'tactical-interaction.js');
  let source = await readFile(interactionPath, 'utf8');
  source = replaceRequired(
    source,
    "  stats.textContent = `HP ${formatNumber(preview.enemy.hp)} · ATK ${formatNumber(preview.enemy.atk)} · DEF ${formatNumber(preview.enemy.def)}`;",
    "  stats.textContent = `HP ${formatNumber(preview.enemy.hp)} · ATK ${formatNumber(preview.enemy.atk)} · DEF ${formatNumber(preview.enemy.def)} · 击败奖励 ${formatNumber(preview.enemy.gold ?? 0)} 金币`;",
    'Enemy gold disclosure'
  );
  await writeFile(interactionPath, source);
}

async function applyMainProductionPatch() {
  const mainPath = join(outDir, 'src', 'main.js');
  let source = await readFile(mainPath, 'utf8');

  const oldDialogue = `function showDialogue(dialogueId, after = null) {\n  const dialogue = getDialogue(dialogueId);\n  if (!dialogue) return;\n  openModal({\n    kicker: dialogue.speaker,\n    title: dialogue.title,\n    body: \`\n      <div class="dialogue-grid">\n        <img src="\${portraitUrl(dialogue.portrait)}" alt="\${escapeHtml(dialogue.speaker)}" />\n        <div class="dialogue-copy">\n          <strong>\${escapeHtml(dialogue.speaker)}</strong>\n          <p>\${escapeHtml(dialogue.text).replaceAll('\\n', '<br>')}</p>\n        </div>\n      </div>\n    \`,\n    actions: [{ label: state.victory && dialogueId === 'ending' ? '查看通关结算' : '继续', className: 'primary', onClick: after }]\n  });\n}\n`;
  const newDialogue = `function showDialogue(dialogueId, after = null, { finalLabel = null } = {}) {\n  const dialogue = getDialogue(dialogueId);\n  if (!dialogue) return;\n  const turns = Array.isArray(dialogue.turns) && dialogue.turns.length\n    ? dialogue.turns\n    : [{ speaker: dialogue.speaker, portrait: dialogue.portrait, text: dialogue.text }];\n  let index = 0;\n\n  const renderTurn = () => {\n    const turn = turns[index];\n    const isLast = index >= turns.length - 1;\n    const label = isLast\n      ? (finalLabel ?? (state.victory ? '查看通关结算' : '继续'))\n      : \`继续 · \${index + 2}/\${turns.length}\`;\n    openModal({\n      kicker: turn.speaker,\n      title: dialogue.title,\n      closable: finalLabel ? false : true,\n      body: \`\n        <div class="dialogue-grid">\n          <img src="\${portraitUrl(turn.portrait)}" alt="\${escapeHtml(turn.speaker)}" />\n          <div class="dialogue-copy">\n            <strong>\${escapeHtml(turn.speaker)}</strong>\n            <p>\${escapeHtml(turn.text).replaceAll('\\n', '<br>')}</p>\n          </div>\n        </div>\n      \`,\n      actions: [{\n        label,\n        className: 'primary',\n        close: isLast,\n        onClick: () => {\n          if (isLast) after?.();\n          else {\n            index += 1;\n            renderTurn();\n          }\n        }\n      }]\n    });\n  };\n\n  renderTurn();\n}\n`;
  // Sequence support now lives in src/main.js, so a production build must not
  // replace it a second time. Keep the old replacement only for a stale
  // checkout that predates the source-level renderer.
  if (!source.includes('function showDialogue(dialogueId, after = null, { finalLabel = null } = {})')) {
    source = replaceRequired(source, oldDialogue, newDialogue, 'Multi-turn dialogue');
  }

  const oldResult = `function handleSceneResult(result) {\n  updateHud();\n  if (result.blocked) showToast(result.reason ?? '无法行动。');\n  if (result.openShop) showShop();\n  if (result.dialogue) {\n    showDialogue(result.dialogue, result.victory ? showVictory : null);\n  } else if (result.victory) {\n    showVictory();\n  }\n  if (result.moved || result.battle || result.floorChanged) autoSave();\n}\n`;
  const newResult = `function handleSceneResult(result) {\n  updateHud();\n  if (result.blocked) showToast(result.reason ?? '无法行动。');\n  if (result.openShop) showShop();\n  if (result.bossEncounter && result.dialogue) {\n    showDialogue(result.dialogue, () => scene?.move(result.resumeDirection), { finalLabel: '开战' });\n  } else if (result.dialogue) {\n    showDialogue(result.dialogue, result.victory ? showVictory : null);\n  } else if (result.victory) {\n    showVictory();\n  }\n  if (result.moved || result.battle || result.floorChanged || result.bossEncounter) autoSave();\n}\n`;
  const oldCouncilResult = `function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged) autoSave();
}
`;
  const newCouncilResult = `function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.bossEncounter && result.dialogue) {
    showDialogue(result.dialogue, () => scene?.move(result.resumeDirection), { finalLabel: '开战' });
  } else if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged || result.bossEncounter) autoSave();
}
`;
  const oldDoctrineCouncilResult = `function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged) autoSave();
}
`;
  const newDoctrineCouncilResult = `function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.bossEncounter && result.dialogue) {
    showDialogue(result.dialogue, () => scene?.move(result.resumeDirection), { finalLabel: '开战' });
  } else if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged || result.bossEncounter) autoSave();
}
`;
  const oldDoctrineCharterCouncilResult = `function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCharter) {
    showAct3Charter();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged) autoSave();
}
`;
  const newDoctrineCharterCouncilResult = `function handleSceneResult(result) {
  updateHud();
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCharter) {
    showAct3Charter();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.bossEncounter && result.dialogue) {
    showDialogue(result.dialogue, () => scene?.move(result.resumeDirection), { finalLabel: '开战' });
  } else if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged || result.bossEncounter) autoSave();
}
`;
  const oldCinematicResult = `function continueSceneResult(result) {
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCharter) {
    showAct3Charter();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged) autoSave();
}
`;
  const newCinematicResult = `function continueSceneResult(result) {
  if (result.blocked) showToast(result.reason ?? '无法行动。');
  if (result.openDoctrine) {
    showRouteDoctrine();
    return;
  }
  if (result.openCharter) {
    showAct3Charter();
    return;
  }
  if (result.openCouncil) {
    if (result.dialogue) showDialogue(result.dialogue, showWarCouncil);
    else showWarCouncil();
    return;
  }
  if (result.openShop) showShop();
  if (result.bossEncounter && result.dialogue) {
    showDialogue(result.dialogue, () => scene?.move(result.resumeDirection), { finalLabel: '开战' });
  } else if (result.dialogue) {
    showDialogue(result.dialogue, result.victory ? showVictory : null);
  } else if (result.victory) {
    showVictory();
  }
  if (result.moved || result.battle || result.floorChanged || result.bossEncounter) autoSave();
}
`;
  source = source.includes(oldCinematicResult)
    ? replaceRequired(source, oldCinematicResult, newCinematicResult, 'Boss dialogue result flow with cinematic battle layer')
    : source.includes(oldDoctrineCharterCouncilResult)
      ? replaceRequired(source, oldDoctrineCharterCouncilResult, newDoctrineCharterCouncilResult, 'Boss dialogue result flow with doctrine, charter and council')
      : source.includes(oldDoctrineCouncilResult)
        ? replaceRequired(source, oldDoctrineCouncilResult, newDoctrineCouncilResult, 'Boss dialogue result flow with doctrine and council')
        : source.includes(oldCouncilResult)
          ? replaceRequired(source, oldCouncilResult, newCouncilResult, 'Boss dialogue result flow with council')
          : replaceRequired(source, oldResult, newResult, 'Boss dialogue result flow');

  await writeFile(mainPath, source);
}

function assertBuild(condition, message) {
  if (!condition) throw new Error(`Production build validation failed: ${message}`);
}

async function validateProductionDemoBuild() {
  const moduleUrl = (relativePath) => pathToFileURL(join(outDir, relativePath)).href;
  const data = await import(moduleUrl('src/game/data.js'));
  const content = await import(moduleUrl('src/game/demo-10-floor-content.js'));
  const hardMode = await import(moduleUrl('src/game/demo-10-floor-hard-mode.js'));
  const progression = await import(moduleUrl('src/game/demo-10-floor-progression.js'));
  const topology = await import(moduleUrl('src/game/demo-10-floor-progression-topology.js'));
  const palaceSpatial = await import(moduleUrl('src/game/demo-10-floor-palace-spatial-redesign.js'));
  const spatial = await import(moduleUrl('src/game/demo-10-floor-spatial-redesign.js'));
  content.applyDemoTenFloorContent({
    enemies: data.ENEMIES,
    floors: data.FLOORS,
    dialogues: data.DIALOGUES,
    gridSize: data.GRID_SIZE
  });
  topology.applyDemoTenFloorProgressionTopology({ enemies: data.ENEMIES, floors: data.FLOORS });
  spatial.applyDemoTenFloorSpatialRedesign({ floors: data.FLOORS, gridSize: data.GRID_SIZE });
  const progressionGrammar = progression.applyDemoTenFloorProgressionGrammar({
    enemies: data.ENEMIES,
    floors: data.FLOORS,
    dialogues: data.DIALOGUES
  });
  palaceSpatial.applyDemoTenFloorPalaceSpatialRedesign({ floors: data.FLOORS, gridSize: data.GRID_SIZE });
  hardMode.applyDemoTenFloorHardMode({ enemies: data.ENEMIES });

  const engine = await import(moduleUrl('src/game/engine.js'));
  const state = engine.createInitialState();
  assertBuild(state.relics.codex === true && state.relics.compass === true, 'Codex and Compass must be initial relics.');
  assertBuild(!state.floorStates.some((floorState) => floorState.map.some((row) => row.includes('item:codex') || row.includes('item:compass'))), 'Initial relic pickups must not remain as dead map rewards.');

  const shopFloors = data.FLOORS.filter((floor) => floor.map.some((row) => row.includes('shop'))).map((floor) => floor.number);
  assertBuild(JSON.stringify(shopFloors) === JSON.stringify([5]), `Act I shop floor must be 5, got ${shopFloors.join('/')}.`);

  state.floor = 4;
  const shopSamples = [{
    floor: data.FLOORS[4].number,
    multiplier: engine.getShopEffectMultiplier(state),
    options: engine.getShopOptions(state)
  }];
  assertBuild(shopSamples[0].options.find((option) => option.id === 'atk').effect.atk === 12, 'F5 ATK shop must scale to +12.');

  const f1EnemyIds = data.FLOORS[0].map.flat()
    .filter((token) => token.startsWith('enemy:'))
    .map((token) => token.slice('enemy:'.length));
  assertBuild(f1EnemyIds.every((enemyId) => data.ENEMIES[enemyId]?.boss !== true), 'F1 must remain a bossless tutorial floor.');
  assertBuild(JSON.stringify(data.FLOORS[4].exitGuardians) === JSON.stringify(['whaleBoss', 'swordBoss', 'dragonBoss']), 'F5 must retain its three-guardian stair seal.');
  assertBuild(JSON.stringify(data.FLOORS[6].exitGuardians) === JSON.stringify(['astralBoss', 'shadowBoss', 'shadowWardBlade', 'shadowWardCantor']), 'F7 must retain its four-guardian stair seal.');

  const preludeState = engine.createInitialState();
  let catBoss = null;
  for (let y = 0; y < data.FLOORS[1].map.length; y += 1) {
    for (let x = 0; x < data.FLOORS[1].map[y].length; x += 1) {
      if (data.FLOORS[1].map[y][x] === 'enemy:catBoss') catBoss = { x, y };
    }
  }
  const bossApproach = catBoss == null ? null : [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dx, dy]) => ({ x: catBoss.x + dx, y: catBoss.y + dy, dx, dy }))
    .find(({ x, y }) => data.FLOORS[1].map[y]?.[x] === '.');
  assertBuild(bossApproach != null, 'F2 cat guardian must have a floor-tile approach.');
  preludeState.floor = 1;
  preludeState.x = bossApproach.x;
  preludeState.y = bossApproach.y;
  const prelude = engine.prepareBossEncounter(preludeState, -bossApproach.dx, -bossApproach.dy);
  assertBuild(prelude?.bossEncounter === true && prelude.dialogue === 'bossCatPreDemo', 'F2 cat guardian must open a pre-battle dialogue.');
  assertBuild(engine.prepareBossEncounter(preludeState, -bossApproach.dx, -bossApproach.dy) === null, 'Boss pre-battle dialogue must trigger only once.');

  const demoSequences = Object.entries(data.DIALOGUES).filter(([id, dialogue]) => id.endsWith('Demo') && Array.isArray(dialogue?.turns));
  assertBuild(demoSequences.length >= 20, 'Every floor must provide pre/post boss dialogue sequences.');
  assertBuild(demoSequences.every(([, dialogue]) => dialogue.turns.length >= 2 && dialogue.turns.length <= 5), 'Boss dialogue sequences must stay within 2-5 turns.');

  // The screenshot gallery is a topology-review tool. It must load the same
  // browser build but cannot be allowed to pull a solver verdict forward into
  // the room-design phase. A new topology automatically suspends old numeric
  // certificates until it has passed the spatial/card review.
  if (process.env.TOWER_SKIP_NUMERIC_VALIDATION === '1' || hardMode.DEMO10_NUMERIC_REBASE_REQUIRED) {
    console.log('PRODUCTION_DEMO_TOPOLOGY_VISUAL_BUILD', JSON.stringify({
      initialRelics: state.relics,
      progressionGrammar,
      shopFloors,
      skipped: hardMode.DEMO10_NUMERIC_REBASE_REQUIRED
        ? 'numeric-rebaseline-required-after-topology-change'
        : 'numeric-solver-probe'
    }));
    return;
  }

  assertBuild(data.ENEMIES.blackSealKeeper.magicPower === hardMode.DEMO10_HARD_MODE_PRESSURE.blackSealKeeperMagicPower, 'F9 boss magic pressure mismatch.');
  assertBuild(data.ENEMIES.blackSealKeeper.def === hardMode.DEMO10_HARD_MODE_PRESSURE.blackSealKeeperDef, 'F9 boss DEF pressure mismatch.');
  assertBuild(data.ENEMIES.voidCore.hp > 3400 && data.ENEMIES.voidCore.magicPower > 164, 'F10 final core must receive the high-floor pressure ramp.');

  const quality = await import(moduleUrl('src/game/demo-10-floor-quality.js'));
  const strategy = await import(moduleUrl('src/solver/greedy-strategy.js'));
  const replay = await import(moduleUrl('src/solver/replay.js'));
  const towerAdapter = await import(moduleUrl('src/solver/tower-adapter.js'));
  const routeCertification = await import(moduleUrl('src/solver/demo-10f-route-family-certification.js'));
  const reports = quality.DEMO10_SIMPLE_BUILD_PORTFOLIO.map((shopCycle) => strategy.runGreedyShopStrategy({
    shopCycle,
    holyPolicy: 'immediate',
    maxIterations: 10_000
  }));
  const winners = reports.filter((report) => report.solvable);
  const proofRoute = strategy.runGreedyShopStrategy({
    ...hardMode.DEMO10_HARD_ROUTE_PROOF,
    traceActions: true,
    maxIterations: 10_000
  });
  const proofReplay = replay.replayTowerStepSkeleton(proofRoute.routeSteps, {
    adapter: towerAdapter.createTowerAdapter(),
    requireGoal: true
  });
  console.log('PRODUCTION_DEMO_BALANCE_PROBE', JSON.stringify(reports.map((report) => ({
    cycle: report.shopCycle.join('-'),
    solvable: report.solvable,
    floor: report.floor,
    hp: report.final.hp,
    atk: report.final.atk,
    def: report.final.def,
    gold: report.final.gold,
    purchases: report.purchases,
    purchaseFloors: [...new Set(report.purchaseLog.map((entry) => entry.floor))],
    failure: report.failure
  }))));
  assertBuild(proofRoute.solvable, 'Production demo must retain a reproducible winning route.');
  assertBuild(proofReplay.ok, 'Production winning route must replay through authoritative engine actions.');
  assertBuild(proofReplay.minNormalizedHpMargin >= 0.04, 'Production proof route is too brittle.');
  assertBuild(proofReplay.minNormalizedHpMargin <= 0.20, 'Production proof route is too forgiving.');
  // Diversity is diagnostic, not a production blocker: a hard tower is allowed
  // to funnel players toward a small number of deliberate solutions as long as
  // its engine-replayed release witness remains valid.
  const routeFamilyProof = routeCertification.certifyDemoTenFloorRouteFamilies({ targetFamilies: 3 });

  console.log('PRODUCTION_DEMO_BUILD', JSON.stringify({
    initialRelics: state.relics,
    progressionGrammar,
    shopFloors,
    shopSamples: shopSamples.map((sample) => ({
      floor: sample.floor,
      multiplier: sample.multiplier,
      effects: Object.fromEntries(sample.options.map((option) => [option.id, option.effect]))
    })),
    hardPressure: hardMode.DEMO10_HARD_MODE_PRESSURE,
    earlyRamp: hardMode.DEMO10_SINGLE_SHOP_EARLY_RAMP,
    ordinaryPressure: hardMode.DEMO10_HARD_MODE_ORDINARY_PRESSURE,
    existenceProof: {
      route: {
        ...hardMode.DEMO10_HARD_ROUTE_PROOF,
        shopCycle: [...hardMode.DEMO10_HARD_ROUTE_PROOF.shopCycle]
      },
      replayOk: proofReplay.ok,
      steps: proofRoute.routeSteps.length,
      final: proofReplay.final,
      minNormalizedHpMargin: proofReplay.minNormalizedHpMargin
    },
    routeFamilyProof: {
      blocking: false,
      discoverySeeds: routeFamilyProof.discoverySeeds,
      replayableWins: routeFamilyProof.replayableWins,
      hardCandidates: routeFamilyProof.hardCandidates,
      discoveredFamilies: routeFamilyProof.discoveredFamilies,
      minimumDecisionDistance: routeFamilyProof.minDistance,
      routes: routeFamilyProof.selected.map((attempt) => ({
        discoverySeed: attempt.id,
        decisions: attempt.family.decisions,
        minNormalizedHpMargin: attempt.family.minNormalizedHpMargin
      }))
    },
    simpleBuilds: reports.map((report) => ({
      cycle: report.shopCycle.join('-'),
      solvable: report.solvable,
      floor: report.floor,
      hp: report.final.hp,
      atk: report.final.atk,
      def: report.final.def,
      purchases: report.purchases,
      failure: report.failure
    }))
  }));
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await copyFile(join(root, 'index.html'), join(outDir, 'index.html'));
await copyFile(join(root, 'styles.css'), join(outDir, 'styles.css'));
await copyFile(join(root, 'anime.css'), join(outDir, 'anime.css'));
await copyFile(join(root, 'ui-v8-4.css'), join(root, 'dist/ui-v8-4.css'));
await copyFile(join(root, 'ui-v8-5.css'), join(root, 'dist/ui-v8-5.css'));
await copyFile(join(root, 'ui-v10-cinematics.css'), join(root, 'dist/ui-v10-cinematics.css'));
await cp(join(root, 'src'), join(outDir, 'src'), { recursive: true });
await cp(join(root, 'public'), outDir, { recursive: true });
await applyEngineProductionPatch();
await applyProductionCanvasPatch();
await applyTacticalInteractionPatch();
await applyMainProductionPatch();
await validateProductionDemoBuild();
console.log(`Static build written to ${outDir}`);
