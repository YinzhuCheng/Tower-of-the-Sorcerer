import test from 'node:test';
import assert from 'node:assert/strict';

import { ENEMIES, FLOORS, GRID_SIZE, ITEMS } from '../src/game/data.js';
import {
  buyShopUpgrade,
  calculateBattle,
  collectItem,
  createInitialState,
  deserializeState,
  getTile,
  serializeState,
  setMagicTier,
  setTile,
  tryMove
} from '../src/game/engine.js';

test('all maps are square and every enemy/item token resolves', () => {
  for (const floor of FLOORS) {
    assert.equal(floor.map.length, GRID_SIZE);
    for (const row of floor.map) {
      assert.equal(row.length, GRID_SIZE);
      for (const token of row) {
        if (token.startsWith('enemy:')) assert.ok(ENEMIES[token.slice(6)], `${token} must exist`);
        if (token.startsWith('item:')) assert.ok(ITEMS[token.slice(5)], `${token} must exist`);
      }
    }
  }
});

test('fixed-damage battle formula handles normal, first strike and double hit', () => {
  const stats = { hp: 100, atk: 20, def: 10 };
  const normal = calculateBattle(stats, { hp: 35, atk: 16, def: 5 });
  assert.deepEqual(
    { rounds: normal.rounds, counterAttacks: normal.counterAttacks, enemyDamage: normal.enemyDamage, totalDamage: normal.totalDamage },
    { rounds: 3, counterAttacks: 2, enemyDamage: 6, totalDamage: 12 }
  );

  const firstStrike = calculateBattle(stats, { hp: 35, atk: 16, def: 5, special: 'firstStrike' });
  assert.equal(firstStrike.counterAttacks, 3);
  assert.equal(firstStrike.totalDamage, 18);

  const doubleHit = calculateBattle(stats, { hp: 35, atk: 16, def: 5, special: 'doubleHit' });
  assert.equal(doubleHit.enemyDamage, 12);
  assert.equal(doubleHit.totalDamage, 24);
});

test('magic damage ignores defense and ward reduces each hit by 20 percent', () => {
  const stats = { hp: 100, atk: 30, def: 999 };
  const enemy = { hp: 50, atk: 1, def: 10, special: 'magic', magicPower: 19 };
  const withoutWard = calculateBattle(stats, enemy, { ward: false });
  const withWard = calculateBattle(stats, enemy, { ward: true });
  assert.equal(withoutWard.totalDamage, 38);
  assert.equal(withWard.enemyDamage, 16);
  assert.equal(withWard.totalDamage, 32);
});

test('player magic blade pays once, improves every hero hit, and never breaks physical immunity', () => {
  const stats = { hp: 100, atk: 20, def: 10 };
  const enemy = { hp: 35, atk: 16, def: 10 };
  const mundane = calculateBattle(stats, enemy);
  const empowered = calculateBattle(stats, enemy, {}, { unlocked: true, mp: 100, maxMp: 100, tier: 2 });
  assert.equal(mundane.rounds, 4);
  assert.equal(empowered.heroDamage, 30);
  assert.equal(empowered.rounds, 2);
  assert.equal(empowered.magicCost, 20);
  assert.equal(empowered.totalDamage, 6, 'MP is paid once; it is not added to enemy damage every round');

  const sealed = calculateBattle(
    { hp: 100, atk: 10, def: 0 },
    { hp: 20, atk: 10, def: 10 },
    {},
    { unlocked: true, mp: 100, maxMp: 100, tier: 10 }
  );
  assert.equal(sealed.winnable, false);
  assert.equal(sealed.reason, '攻击不足，无法破防');
});

test('selected magic tier is spent only after a legal battle and becomes an explicit save field', () => {
  const state = createInitialState();
  state.magic = { unlocked: true, mp: 100, maxMp: 100, tier: 0 };
  const selection = setMagicTier(state, 2);
  assert.equal(selection.ok, true);
  setTile(state, state.x + 1, state.y, 'enemy:catScout');
  const beforeMp = state.magic.mp;
  const result = tryMove(state, 1, 0);
  assert.equal(result.moved, true);
  assert.equal(result.battle.magicCost, 20);
  assert.equal(state.magic.mp, beforeMp - 20);
  assert.deepEqual(deserializeState(serializeState(state)).magic, state.magic);
});

test('v1 saves receive a dormant magic field without changing their map contract', () => {
  const state = createInitialState();
  const legacy = { ...state, version: 1 };
  delete legacy.magic;
  const restored = deserializeState(JSON.stringify(legacy));
  assert.deepEqual(restored.magic, { unlocked: false, mp: 0, maxMp: 0, tier: 0 });
});

test('v2 saves receive an untouched war-council state', () => {
  const state = createInitialState();
  const legacy = { ...state, version: 2 };
  delete legacy.council;
  const restored = deserializeState(JSON.stringify(legacy));
  assert.deepEqual(restored.council, { completed: false, plan: null, outcome: null });
});

test('battle is blocked when attack cannot pierce defense or damage is exactly lethal', () => {
  const noPierce = calculateBattle({ hp: 100, atk: 10, def: 10 }, { hp: 20, atk: 10, def: 10 });
  assert.equal(noPierce.winnable, false);
  assert.equal(noPierce.totalDamage, Infinity);

  const lethal = calculateBattle({ hp: 10, atk: 20, def: 0 }, { hp: 20, atk: 10, def: 0 });
  assert.equal(lethal.totalDamage, 0);
  assert.equal(lethal.winnable, true);

  const survivable = calculateBattle({ hp: 10, atk: 20, def: 0 }, { hp: 40, atk: 5, def: 0 });
  assert.equal(survivable.totalDamage, 5);
  assert.equal(survivable.winnable, true);

  const exactlyLethal = calculateBattle({ hp: 10, atk: 20, def: 0 }, { hp: 40, atk: 5, def: 0, special: 'doubleHit' });
  assert.equal(exactlyLethal.totalDamage, 10);
  assert.equal(exactlyLethal.winnable, false);
});

test('card doors remain closed without a card and consume exactly one card when opened', () => {
  const state = createInitialState();
  setTile(state, state.x + 1, state.y, 'door:sun');

  const blocked = tryMove(state, 1, 0);
  assert.equal(blocked.blocked, true);
  assert.match(blocked.reason, /日曜卡/);
  assert.equal(getTile(state, state.x + 1, state.y), 'door:sun');

  state.cards.sun = 1;
  const opened = tryMove(state, 1, 0);
  assert.equal(opened.moved, true);
  assert.equal(state.cards.sun, 0);
  assert.equal(getTile(state, state.x, state.y), '.');
});

test('upper stairs stay sealed until the current floor boss is defeated', () => {
  const state = createInitialState();
  state.floor = 6;
  // Floor 7 has an alternate corridor adjacent to U, so this reproduces the
  // topology that previously allowed the solver/player to enter floor 8 with
  // only six recovered cores.
  state.x = 9;
  state.y = 2;
  assert.equal(getTile(state, 9, 1), 'U');
  assert.equal(state.floorStates[6].bossDefeated, false);

  const blocked = tryMove(state, 0, -1);
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.moved, false);
  assert.equal(state.floor, 6);
  assert.match(blocked.reason, /守护者|阵眼/);

  state.floorStates[6].bossDefeated = true;
  const opened = tryMove(state, 0, -1);
  assert.equal(opened.blocked, false);
  assert.equal(opened.moved, true);
  assert.equal(opened.floorChanged, true);
  assert.equal(state.floor, 7);
});

test('items and relics apply deterministic permanent effects only once where applicable', () => {
  const state = createInitialState();
  collectItem(state, 'atk');
  assert.equal(state.stats.atk, 18);

  collectItem(state, 'holy');
  assert.equal(state.stats.maxHp, 2400);
  assert.equal(state.stats.hp, 2400);
  collectItem(state, 'holy');
  assert.equal(state.stats.maxHp, 2400, 'holy relic must not double HP twice');
});

test('switch requirements open linked gates only when complete', () => {
  const state = createInitialState();
  state.floor = 2;
  state.x = 1;
  state.y = 1;
  setTile(state, 2, 1, 'switch:tideA');
  setTile(state, 3, 1, 'gate:tide');

  const first = tryMove(state, 1, 0);
  assert.equal(first.moved, true);
  assert.equal(getTile(state, 3, 1), 'gate:tide');

  setTile(state, 2, 2, 'switch:tideB');
  state.x = 1;
  state.y = 2;
  const second = tryMove(state, 1, 0);
  assert.equal(second.moved, true);
  assert.equal(getTile(state, 3, 1), '.');
});

test('mirror rune sequence resets on error and opens its gate for A-B-C', () => {
  const state = createInitialState();
  state.floor = 5;
  setTile(state, 5, 5, 'gate:mirror');

  const stepOn = (id) => {
    state.x = 1;
    state.y = 1;
    setTile(state, 2, 1, `rune:${id}`);
    return tryMove(state, 1, 0);
  };

  stepOn('B');
  assert.equal(state.floorStates[5].sequenceProgress, 0);
  stepOn('A');
  stepOn('B');
  const completed = stepOn('C');
  assert.equal(completed.events[0].sequence.completed, true);
  assert.equal(getTile(state, 5, 5), '.');
});

test('three-spectrum gate consumes one card of each color', () => {
  const state = createInitialState();
  state.floor = 6;
  state.x = 1;
  state.y = 1;
  setTile(state, 2, 1, 'gate:tri');

  let result = tryMove(state, 1, 0);
  assert.equal(result.blocked, true);
  state.cards = { sun: 2, moon: 1, star: 3 };
  result = tryMove(state, 1, 0);
  assert.equal(result.moved, true);
  assert.deepEqual(state.cards, { sun: 1, moon: 0, star: 2 });
});

test('final boss changes phase in place, then sets victory after the core is defeated', () => {
  const state = createInitialState();
  state.floor = 7;
  state.x = 1;
  state.y = 1;
  state.stats = { hp: 100000, maxHp: 100000, atk: 1000, def: 1000, gold: 0 };
  setTile(state, 2, 1, 'enemy:finalQueen');

  const phaseOne = tryMove(state, 1, 0);
  assert.equal(phaseOne.phaseChanged, true);
  assert.equal(phaseOne.moved, false);
  assert.equal(getTile(state, 2, 1), 'enemy:voidCore');

  const phaseTwo = tryMove(state, 1, 0);
  assert.equal(phaseTwo.victory, true);
  assert.equal(state.victory, true);
  assert.equal(state.x, 2);
  assert.equal(state.y, 1);
});

test('shop prices rise after purchase and save data round-trips', () => {
  const state = createInitialState();
  state.stats.gold = 1000;
  const first = buyShopUpgrade(state, 'atk');
  const second = buyShopUpgrade(state, 'def');
  assert.equal(first.cost, 45);
  assert.equal(second.cost, 70);
  assert.equal(state.stats.atk, 19);
  assert.equal(state.stats.def, 17);

  const restored = deserializeState(serializeState(state));
  assert.deepEqual(restored, state);
  assert.throws(() => deserializeState('{"version":999}'), /不兼容|损坏/);
});
