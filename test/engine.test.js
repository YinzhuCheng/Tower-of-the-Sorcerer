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
