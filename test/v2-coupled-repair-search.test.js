import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findFixedWitnessCompensationBoundary,
  listLatePressureCompensationParameters
} from '../src/tuner/v2-coupled-repair-search.js';

test('late compensation catalogue excludes F5 and supply fields', () => {
  const parameters = listLatePressureCompensationParameters({ minFloor: 6 });
  assert.ok(parameters.length > 0);
  assert.ok(parameters.every((parameter) => parameter.family === 'enemy'));
  assert.ok(parameters.every((parameter) => parameter.role === 'hazard'));
  assert.ok(parameters.every((parameter) => Number(parameter.floor) >= 6));
  assert.ok(parameters.every((parameter) => !parameter.fields.includes('gold')));
});

test('fixed-witness compensation boundary finds the least hardening inside replayable interval', () => {
  const parameter = { roundTo: 1 };
  const result = findFixedWitnessCompensationBoundary({
    parameter,
    originalValue: 10,
    maxValue: 30,
    pressureUpper: 0.25,
    evaluate(value) {
      if (value >= 25) return { replayOk: false, minNormalizedHpMargin: null };
      return {
        replayOk: true,
        minNormalizedHpMargin: 0.60 - (value - 10) * 0.03,
        terminalHp: 1000 - value
      };
    }
  });
  assert.equal(result.targetReachable, true);
  assert.equal(result.maxReplayableValue, 24);
  assert.equal(result.boundary.value, 22);
  assert.ok(result.boundary.evaluation.minNormalizedHpMargin <= 0.25);
});

test('compensation boundary reports target unreachable when the route cliffs first', () => {
  const parameter = { roundTo: 1 };
  const result = findFixedWitnessCompensationBoundary({
    parameter,
    originalValue: 10,
    maxValue: 20,
    pressureUpper: 0.25,
    evaluate(value) {
      if (value >= 16) return { replayOk: false, minNormalizedHpMargin: null };
      return { replayOk: true, minNormalizedHpMargin: 0.60 - (value - 10) * 0.02 };
    }
  });
  assert.equal(result.targetReachable, false);
  assert.equal(result.maxReplayableValue, 15);
  assert.equal(result.boundary, null);
});

test('compensation boundary respects coarse HP-like steps', () => {
  const parameter = { roundTo: 10 };
  const result = findFixedWitnessCompensationBoundary({
    parameter,
    originalValue: 100,
    maxValue: 200,
    pressureUpper: 0.30,
    evaluate(value) {
      return {
        replayOk: value <= 190,
        minNormalizedHpMargin: 0.70 - (value - 100) / 200
      };
    }
  });
  assert.equal(result.targetReachable, true);
  assert.equal(result.boundary.value, 180);
});
