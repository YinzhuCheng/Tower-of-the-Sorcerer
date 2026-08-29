const CARD_TYPES = Object.freeze(['star', 'moon', 'sun']);
const FINAL_SEAL_ID = 'throneSeal';
const F8_VAULT_ID = 'hushVault';
const F8_VAULT_GUARDIANS = Object.freeze(['hushVaultBlade', 'hushVaultCantor']);

function walkMap(floor, visit) {
  for (let y = 0; y < (floor?.map?.length ?? 0); y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) visit(floor.map[y][x], x, y);
  }
}

function replaceTokenEverywhere(floors, from, to) {
  let replaced = 0;
  const locations = [];
  for (const floor of floors) {
    walkMap(floor, (token, x, y) => {
      if (token !== from) return;
      floor.map[y][x] = to;
      replaced += 1;
      locations.push({ floor: floor.number, x, y });
    });
  }
  return { replaced, locations };
}

function updateCodesignSlotExpectations(floor) {
  if (!floor?.codesignSlots) return;
  const updated = {};
  let changed = false;
  for (const [id, spec] of Object.entries(floor.codesignSlots)) {
    const actual = floor.map?.[spec.y]?.[spec.x];
    if (actual === spec.expected) {
      updated[id] = spec;
      continue;
    }
    if ((spec.expected === 'item:sun' && actual === 'item:star')
      || (spec.expected === 'door:sun' && actual === 'door:star')
      || (floor.number === 8 && id === 'cardSunEast' && actual === `gate:${F8_VAULT_ID}`)
      || (floor.number === 8 && id === 'doorSunEast' && actual === 'item:moon')) {
      updated[id] = Object.freeze({ ...spec, expected: actual });
      changed = true;
      continue;
    }
    updated[id] = spec;
  }
  if (changed) floor.codesignSlots = Object.freeze(updated);
}

function reserveSunLocation(floors, originalSunItems, finalFloorNumber) {
  const candidates = originalSunItems
    .filter((entry) => entry.floor < finalFloorNumber)
    .sort((a, b) => b.floor - a.floor || a.y - b.y || a.x - b.x);
  const chosen = candidates[0];
  if (!chosen) return null;
  const floor = floors.find((entry) => entry.number === chosen.floor);
  if (!floor) return null;
  floor.map[chosen.y][chosen.x] = 'item:sun';
  return Object.freeze({ ...chosen });
}

function rewritePreFinalCardGates(floors, finalFloorNumber) {
  const rewritten = [];
  for (const floor of floors) {
    if (floor.number >= finalFloorNumber || !floor.puzzles?.cardGates) continue;
    const cardGates = {};
    let floorChanged = false;
    for (const [gateId, requirements] of Object.entries(floor.puzzles.cardGates)) {
      const next = { ...requirements };
      if ((next.sun ?? 0) > 0) {
        next.star = (next.star ?? 0) + next.sun;
        delete next.sun;
        floorChanged = true;
        rewritten.push({ floor: floor.number, gateId });
      }
      cardGates[gateId] = next;
    }
    if (floorChanged) floor.puzzles = { ...floor.puzzles, cardGates };
  }
  return rewritten;
}

function rewriteLegacyTriGate(floors, dialogues) {
  const floor7 = floors.find((floor) => floor.number === 7);
  if (!floor7?.puzzles?.triGate) return null;
  const gateId = floor7.puzzles.triGate;
  const cardGates = {
    ...(floor7.puzzles.cardGates ?? {}),
    [gateId]: { moon: 1, star: 1 }
  };
  const puzzles = { ...floor7.puzzles, cardGates };
  delete puzzles.triGate;
  floor7.puzzles = puzzles;
  floor7.objective = '集齐月卡与星卡解除双相结界，击败鸦羽并回收最后一枚魔力核心。日卡留给王座最深处的唯一封印。';
  if (dialogues?.floor7 && !Array.isArray(dialogues.floor7.turns)) {
    dialogues.floor7 = {
      ...dialogues.floor7,
      text: '“把月卡和星卡带来。双相结界会检查你是否懂得保留真正稀有的权限。”\n\n这是最后一道核心阵。日卡不会在这里消耗——王座深处只有一处封印配得上它。'
    };
  }
  return Object.freeze({ floor: 7, gateId, requirements: Object.freeze({ moon: 1, star: 1 }) });
}

function assertToken(floor, x, y, expected, label) {
  const actual = floor?.map?.[y]?.[x];
  if (actual !== expected) {
    throw new Error(`10F ${label} expected ${expected} at ${x},${y}, got ${actual}.`);
  }
}

function installFloor8GuardianVault(floors, enemies) {
  const floor = floors.find((entry) => entry.number === 8);
  if (!floor) throw new Error('10F guardian vault requires floor 8.');

  if (floor.puzzles?.guardianGates?.[F8_VAULT_ID]) {
    return Object.freeze({
      floor: 8,
      gateId: F8_VAULT_ID,
      guardians: F8_VAULT_GUARDIANS,
      gateTiles: Object.freeze([{ x: 8, y: 7 }]),
      rewardTiles: Object.freeze([{ x: 9, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 9, y: 9 }])
    });
  }

  // The lower-right branch is deliberately converted into a real chamber:
  // two distinct elite guardians stand outside, while one narrow entrance
  // seals a 2x3 reward room. The hushA switch is moved one tile left so
  // the vault remains entirely optional for the main palaceWarden -> U route.
  assertToken(floor, 7, 7, 'switch:hushA', 'F8 vault switch source');
  assertToken(floor, 8, 7, 'item:star', 'F8 vault star source');
  assertToken(floor, 7, 8, '.', 'F8 vault guardian slot');
  assertToken(floor, 8, 8, '#', 'F8 vault chamber wall');
  assertToken(floor, 9, 8, 'door:star', 'F8 vault former card door');
  assertToken(floor, 6, 9, 'item:def', 'F8 vault switch destination');
  assertToken(floor, 7, 9, '.', 'F8 vault second guardian slot');
  assertToken(floor, 8, 9, 'item:hp', 'F8 vault hp source');
  assertToken(floor, 9, 9, '.', 'F8 vault reward destination');

  Object.assign(enemies, {
    hushVaultBlade: {
      name: '寂光双卫·刃', portrait: 'sword_boss', faction: '静默前庭·宝库', floor: 8,
      hp: 1500, atk: 214, def: 88, gold: 280, boss: true, special: 'firstStrike',
      description: '不负责封锁上楼，而是与另一名守卫共同守住王庭侧翼宝库。击败两人后宝库结界才会解除。'
    },
    hushVaultCantor: {
      name: '寂光双卫·咏', portrait: 'eclipse_mage', faction: '静默前庭·宝库', floor: 8,
      hp: 1450, atk: 198, def: 84, gold: 280, boss: true, special: 'magic', magicPower: 132,
      description: '双卫中的术式守门人。她的存在让宝库成为高价值可选战，而不是每层都要缴纳的 Boss 税。'
    }
  });

  floor.map[9][6] = 'switch:hushA';
  floor.map[7][7] = 'enemy:hushVaultBlade';
  floor.map[8][7] = 'enemy:hushVaultCantor';
  floor.map[7][8] = `gate:${F8_VAULT_ID}`;
  floor.map[8][8] = 'item:def';
  floor.map[9][8] = '#';
  floor.map[7][9] = 'item:star';
  floor.map[8][9] = 'item:moon';
  floor.map[9][9] = 'item:hp';

  floor.puzzles = {
    ...(floor.puzzles ?? {}),
    guardianGates: {
      ...(floor.puzzles?.guardianGates ?? {}),
      [F8_VAULT_ID]: [...F8_VAULT_GUARDIANS]
    }
  };
  floor.objective = '激活两枚静默开关并击败执剑官维拉即可上楼；侧翼寂光双卫只守宝库，击败两人可开启月卡与高价值资源房。';

  return Object.freeze({
    floor: 8,
    gateId: F8_VAULT_ID,
    guardians: F8_VAULT_GUARDIANS,
    gateTiles: Object.freeze([{ x: 8, y: 7 }]),
    rewardTiles: Object.freeze([{ x: 9, y: 7 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 9, y: 9 }])
  });
}

function isBossEncounterToken(token, enemies) {
  if (!String(token).startsWith('enemy:')) return false;
  const enemyId = String(token).slice(6);
  const enemy = enemies?.[enemyId];
  return Boolean(enemy?.boss && (enemy.phaseNext || enemy.finalBoss || enemyId === 'finalQueen'));
}

function findVisibleFinalEncounter(floor, enemies) {
  let best = null;
  walkMap(floor, (token, x, y) => {
    if (!isBossEncounterToken(token, enemies)) return;
    const enemyId = String(token).slice(6);
    const enemy = enemies[enemyId];
    const priority = enemy.phaseNext ? 3 : enemy.finalBoss ? 2 : 1;
    if (!best || priority > best.priority) best = { x, y, token, enemyId, priority };
  });
  return best;
}

function directNeighbors(x, y) {
  return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
}

function isApproachToken(token) {
  return token !== undefined && token !== null && token !== '#';
}

function isRelocatableReward(token) {
  return String(token).startsWith('item:');
}

function nearestEmptyFloor(floor, source, forbidden) {
  const candidates = [];
  walkMap(floor, (token, x, y) => {
    const key = `${x},${y}`;
    if (token !== '.' || forbidden.has(key)) return;
    candidates.push({
      x,
      y,
      distance: Math.abs(x - source.x) + Math.abs(y - source.y)
    });
  });
  candidates.sort((a, b) => a.distance - b.distance || a.y - b.y || a.x - b.x);
  return candidates[0] ?? null;
}

function installFinalThroneSeal(floor, enemies) {
  const encounter = findVisibleFinalEncounter(floor, enemies);
  if (!encounter) return Object.freeze({ encounter: null, sealTiles: [], relocatedRewards: [] });

  const neighborCells = directNeighbors(encounter.x, encounter.y)
    .map(([x, y]) => ({ x, y, token: floor.map?.[y]?.[x] }))
    .filter((cell) => isApproachToken(cell.token));
  const forbidden = new Set([
    `${encounter.x},${encounter.y}`,
    ...neighborCells.map((cell) => `${cell.x},${cell.y}`)
  ]);
  const relocatedRewards = [];

  for (const cell of neighborCells) {
    if (!isRelocatableReward(cell.token)) continue;
    const destination = nearestEmptyFloor(floor, cell, forbidden);
    if (!destination) throw new Error(`10F throne seal cannot relocate ${cell.token} from ${cell.x},${cell.y}.`);
    floor.map[destination.y][destination.x] = cell.token;
    forbidden.add(`${destination.x},${destination.y}`);
    relocatedRewards.push(Object.freeze({
      token: cell.token,
      from: Object.freeze({ x: cell.x, y: cell.y }),
      to: Object.freeze({ x: destination.x, y: destination.y })
    }));
  }

  for (const cell of neighborCells) floor.map[cell.y][cell.x] = `gate:${FINAL_SEAL_ID}`;
  floor.puzzles = {
    ...(floor.puzzles ?? {}),
    cardGates: {
      ...(floor.puzzles?.cardGates ?? {}),
      [FINAL_SEAL_ID]: { sun: 1 }
    }
  };
  floor.objective = '突破王座近卫，保留唯一一张日卡解除王座见面结界，再击败无声女王及其黯星核心。结界之后没有商店，也没有补救。';

  return Object.freeze({
    encounter: Object.freeze({ x: encounter.x, y: encounter.y, enemyId: encounter.enemyId }),
    sealTiles: Object.freeze(neighborCells.map((cell) => Object.freeze({ x: cell.x, y: cell.y }))),
    relocatedRewards: Object.freeze(relocatedRewards)
  });
}

function countCards(floors) {
  const supply = { star: 0, moon: 0, sun: 0 };
  const doors = { star: 0, moon: 0, sun: 0 };
  for (const floor of floors) {
    walkMap(floor, (token) => {
      if (String(token).startsWith('item:')) {
        const card = String(token).slice(5);
        if (CARD_TYPES.includes(card)) supply[card] += 1;
      } else if (String(token).startsWith('door:')) {
        const card = String(token).slice(5);
        if (CARD_TYPES.includes(card)) doors[card] += 1;
      }
    });
  }
  return { supply, doors };
}

/**
 * Demo-only progression grammar.
 *
 * The canonical eight-floor dataset is intentionally not changed. This helper
 * runs after the 10F overlay is assembled and gives the browser milestone a
 * clear permission hierarchy: Star = common, Moon = strategic, Sun = unique
 * final-audience key. It also installs the first real optional guardian vault,
 * proving that concentrated bosses can protect rewards without taxing stairs.
 */
export function applyDemoTenFloorProgressionGrammar({ floors, enemies, dialogues } = {}) {
  if (!Array.isArray(floors) || floors.length !== 10) {
    throw new Error('10F progression grammar requires an assembled ten-floor demo.');
  }
  const finalFloorNumber = Math.max(...floors.map((floor) => floor.number));
  const originalSunItems = [];
  for (const floor of floors) {
    walkMap(floor, (token, x, y) => {
      if (token === 'item:sun') originalSunItems.push({ floor: floor.number, x, y });
    });
  }

  const sunItems = replaceTokenEverywhere(floors, 'item:sun', 'item:star');
  const sunDoors = replaceTokenEverywhere(floors, 'door:sun', 'door:star');
  const rewrittenCardGates = rewritePreFinalCardGates(floors, finalFloorNumber);
  const legacyTriGate = rewriteLegacyTriGate(floors, dialogues);
  const uniqueSunLocation = reserveSunLocation(floors, originalSunItems, finalFloorNumber);
  const guardianVault = installFloor8GuardianVault(floors, enemies);
  const finalFloor = floors.find((floor) => floor.number === finalFloorNumber);
  const throneSeal = installFinalThroneSeal(finalFloor, enemies);

  for (const floor of floors) updateCodesignSlotExpectations(floor);
  if (dialogues?.floor10 && !Array.isArray(dialogues.floor10.turns)) {
    dialogues.floor10 = {
      ...dialogues.floor10,
      text: '“你一路把最普通的星卡当作消耗品，把月卡留给真正值得的分支。现在，把唯一的日卡拿出来。”\n\n日辉照亮整面王座结界。最后一次权限选择之后，只剩女王本人。'
    };
  }

  const counts = countCards(floors);
  return Object.freeze({
    finalFloorNumber,
    demotedSunItems: sunItems.replaced - (uniqueSunLocation ? 1 : 0),
    demotedSunDoors: sunDoors.replaced,
    rewrittenCardGates: Object.freeze(rewrittenCardGates),
    legacyTriGate,
    uniqueSunLocation,
    guardianVault,
    throneSeal,
    supply: Object.freeze(counts.supply),
    doors: Object.freeze(counts.doors)
  });
}

export {
  FINAL_SEAL_ID as DEMO10_FINAL_SUN_SEAL_ID,
  F8_VAULT_ID as DEMO10_F8_VAULT_ID,
  F8_VAULT_GUARDIANS as DEMO10_F8_VAULT_GUARDIANS
};
