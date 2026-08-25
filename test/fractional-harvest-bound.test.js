import test from 'node:test';
import assert from 'node:assert/strict';
import { fractionalMinimumCostForValue } from '../src/solver/tower-bounds.js';

test('fractional harvest chooses cheapest cost/value offers first', () => {
  const offers = [
    { value: 100, cost: 20 }, // 0.20 / gold
    { value: 100, cost: 5 },  // 0.05 / gold
    { value: 50, cost: 5 }    // 0.10 / gold
  ];
  assert.equal(fractionalMinimumCostForValue(offers, 0), 0);
  assert.equal(fractionalMinimumCostForValue(offers, 100), 5);
  // Need 125 value: take all 100@5 then half of 50@5 => 7.5, floored
  // deliberately downward so floating-point cannot overstate a damage lower bound.
  assert.equal(fractionalMinimumCostForValue(offers, 125), 7);
  // 175: 100@5 + 50@5 + 25/100 of the expensive offer => 15.
  assert.equal(fractionalMinimumCostForValue(offers, 175), 15);
});

test('fractional harvest remains optimistic for an impossible value request', () => {
  const offers = [{ value: 10, cost: 10 }];
  // Callers derive purchase count from the same optimistic total, so this case
  // should not normally occur. Returning zero is intentionally loose/safe rather
  // than manufacturing an infeasibility claim from inconsistent diagnostics.
  assert.equal(fractionalMinimumCostForValue(offers, 11), 0);
});

test('zero-cost gold never creates positive harvest damage', () => {
  const offers = [
    { value: 50, cost: 0 },
    { value: 50, cost: 20 }
  ];
  assert.equal(fractionalMinimumCostForValue(offers, 40), 0);
  assert.equal(fractionalMinimumCostForValue(offers, 50), 0);
  assert.equal(fractionalMinimumCostForValue(offers, 75), 10);
});
