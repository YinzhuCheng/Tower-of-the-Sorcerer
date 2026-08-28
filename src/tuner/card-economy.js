export const CARD_TIERS = Object.freeze(['star', 'moon', 'sun']);

function emptyCounts() {
  return { star: 0, moon: 0, sun: 0 };
}

function addCounts(target, source) {
  for (const card of CARD_TIERS) target[card] += source[card] ?? 0;
  return target;
}

function cardEventsOnFloor(floor) {
  const supply = emptyCounts();
  const doorDemand = emptyCounts();
  const events = [];
  for (let y = 0; y < (floor.map?.length ?? 0); y += 1) {
    for (let x = 0; x < floor.map[y].length; x += 1) {
      const token = String(floor.map[y][x]);
      if (token.startsWith('item:')) {
        const card = token.slice(5);
        if (CARD_TIERS.includes(card)) {
          supply[card] += 1;
          events.push(Object.freeze({ floor: floor.number, x, y, type: 'supply', card, amount: 1, token }));
        }
      } else if (token.startsWith('door:')) {
        const card = token.slice(5);
        if (CARD_TIERS.includes(card)) {
          doorDemand[card] += 1;
          events.push(Object.freeze({ floor: floor.number, x, y, type: 'door-demand', card, amount: 1, token }));
        }
      }
    }
  }

  const gateDemand = emptyCounts();
  for (const [gateId, requirements] of Object.entries(floor.puzzles?.cardGates ?? {})) {
    for (const card of CARD_TIERS) {
      const amount = Math.max(0, Math.floor(Number(requirements?.[card]) || 0));
      if (amount <= 0) continue;
      gateDemand[card] += amount;
      events.push(Object.freeze({
        floor: floor.number,
        type: 'gate-demand',
        gateId,
        card,
        amount
      }));
    }
  }

  // Historical compatibility only. Explicit cardGates take precedence.
  if (floor.puzzles?.triGate && !floor.puzzles?.cardGates?.[floor.puzzles.triGate]) {
    for (const card of CARD_TIERS) {
      gateDemand[card] += 1;
      events.push(Object.freeze({
        floor: floor.number,
        type: 'legacy-tri-demand',
        gateId: floor.puzzles.triGate,
        card,
        amount: 1
      }));
    }
  }

  const demand = addCounts(addCounts(emptyCounts(), doorDemand), gateDemand);
  return Object.freeze({
    floor: floor.number,
    supply: Object.freeze(supply),
    doorDemand: Object.freeze(doorDemand),
    gateDemand: Object.freeze(gateDemand),
    demand: Object.freeze(demand),
    events: Object.freeze(events)
  });
}

export function analyzeCardEconomy(floors) {
  const perFloor = floors.map(cardEventsOnFloor);
  const supply = emptyCounts();
  const demand = emptyCounts();
  const doorDemand = emptyCounts();
  const gateDemand = emptyCounts();
  const events = [];
  for (const floor of perFloor) {
    addCounts(supply, floor.supply);
    addCounts(demand, floor.demand);
    addCounts(doorDemand, floor.doorDemand);
    addCounts(gateDemand, floor.gateDemand);
    events.push(...floor.events);
  }
  return Object.freeze({
    supply: Object.freeze(supply),
    demand: Object.freeze(demand),
    doorDemand: Object.freeze(doorDemand),
    gateDemand: Object.freeze(gateDemand),
    net: Object.freeze(Object.fromEntries(CARD_TIERS.map((card) => [card, supply[card] - demand[card]]))),
    perFloor: Object.freeze(perFloor),
    events: Object.freeze(events)
  });
}

export const DEMO10_CARD_HIERARCHY_TARGETS = Object.freeze({
  sunSupplyExact: 1,
  sunPreFinalDemandMax: 0,
  finalSunDemandMin: 1,
  finalSunGateId: 'throneSeal',
  requireStarSupplyAboveMoon: true,
  requireMoonSupplyAboveSun: true
});

export function validateDemoTenFloorCardHierarchy(floors, targets = DEMO10_CARD_HIERARCHY_TARGETS) {
  const economy = analyzeCardEconomy(floors);
  const violations = [];
  const finalFloorNumber = Math.max(...floors.map((floor) => floor.number));
  const preFinalSunDemand = economy.perFloor
    .filter((floor) => floor.floor < finalFloorNumber)
    .reduce((sum, floor) => sum + floor.demand.sun, 0);
  const finalSunDemand = economy.perFloor
    .filter((floor) => floor.floor === finalFloorNumber)
    .reduce((sum, floor) => sum + floor.demand.sun, 0);
  const finalSunGate = economy.events.some((event) => event.floor === finalFloorNumber
    && event.type === 'gate-demand'
    && event.gateId === targets.finalSunGateId
    && event.card === 'sun');

  if (economy.supply.sun !== targets.sunSupplyExact) {
    violations.push(`sun-supply:${economy.supply.sun}!=${targets.sunSupplyExact}`);
  }
  if (preFinalSunDemand > targets.sunPreFinalDemandMax) {
    violations.push(`sun-pre-final-demand:${preFinalSunDemand}>${targets.sunPreFinalDemandMax}`);
  }
  if (finalSunDemand < targets.finalSunDemandMin) {
    violations.push(`sun-final-demand:${finalSunDemand}<${targets.finalSunDemandMin}`);
  }
  if (!finalSunGate) violations.push(`sun-final-gate:${targets.finalSunGateId}:missing`);
  if (targets.requireStarSupplyAboveMoon && economy.supply.star <= economy.supply.moon) {
    violations.push(`star-supply:${economy.supply.star}<=moon:${economy.supply.moon}`);
  }
  if (targets.requireMoonSupplyAboveSun && economy.supply.moon <= economy.supply.sun) {
    violations.push(`moon-supply:${economy.supply.moon}<=sun:${economy.supply.sun}`);
  }

  return Object.freeze({
    valid: violations.length === 0,
    finalFloorNumber,
    preFinalSunDemand,
    finalSunDemand,
    finalSunGate,
    economy,
    violations: Object.freeze(violations)
  });
}
