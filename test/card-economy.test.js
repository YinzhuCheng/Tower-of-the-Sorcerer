import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analyzeCardEconomy,
  validateDemoTenFloorCardHierarchy
} from '../src/tuner/card-economy.js';

function floor(number, rows, puzzles = undefined) {
  return { number, map: rows.map((row) => row.split(' ')), ...(puzzles ? { puzzles } : {}) };
}

test('card economy counts ordinary doors and grouped card gates once by requirement', () => {
  const floors = [
    floor(1, ['item:star door:star item:moon']),
    floor(2, ['item:star item:star item:sun']),
    floor(3, ['gate:throneSeal gate:throneSeal gate:throneSeal'], {
      cardGates: { throneSeal: { sun: 1 } }
    })
  ];
  const economy = analyzeCardEconomy(floors);
  assert.deepEqual(economy.supply, { star: 3, moon: 1, sun: 1 });
  assert.deepEqual(economy.demand, { star: 1, moon: 0, sun: 1 });
  assert.equal(economy.perFloor[2].gateDemand.sun, 1, 'a wide seal should cost one Sun card, not one per tile');
});

test('demo hierarchy requires star > moon > one Sun and reserves Sun for final seal', () => {
  const validFloors = [
    floor(1, ['item:star item:star item:moon item:moon']),
    floor(2, ['item:star item:star item:sun .']),
    floor(3, ['gate:throneSeal gate:throneSeal .'], {
      cardGates: { throneSeal: { sun: 1 } }
    })
  ];
  const valid = validateDemoTenFloorCardHierarchy(validFloors);
  assert.equal(valid.valid, true);
  assert.equal(valid.preFinalSunDemand, 0);
  assert.equal(valid.finalSunDemand, 1);
  assert.deepEqual(valid.economy.supply, { star: 4, moon: 2, sun: 1 });

  const invalidFloors = [
    floor(1, ['item:sun door:sun item:moon']),
    floor(2, ['item:sun item:star .']),
    floor(3, ['. . .'])
  ];
  const invalid = validateDemoTenFloorCardHierarchy(invalidFloors);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.violations.some((entry) => entry.startsWith('sun-supply:')));
  assert.ok(invalid.violations.some((entry) => entry.startsWith('sun-pre-final-demand:')));
});
