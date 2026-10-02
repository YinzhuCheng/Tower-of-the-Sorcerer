function uniqueIds(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export function getFloorExitGuardianIds(floor) {
  if (!floor) return [];
  if (Array.isArray(floor.exitGuardians)) return uniqueIds(floor.exitGuardians);
  return floor.boss ? [floor.boss] : [];
}

export function getDefeatedBossIds(floorState, floor) {
  const defeated = new Set(Array.isArray(floorState?.defeatedBossIds) ? floorState.defeatedBossIds : []);
  // Backward compatibility for existing saves and the eight-floor research baseline.
  if (floorState?.bossDefeated && floor?.boss) defeated.add(floor.boss);
  return defeated;
}

export function getRemainingExitGuardianIds(floorState, floor) {
  const defeated = getDefeatedBossIds(floorState, floor);
  return getFloorExitGuardianIds(floor).filter((enemyId) => !defeated.has(enemyId));
}

export function areFloorExitGuardiansDefeated(floorState, floor) {
  return getRemainingExitGuardianIds(floorState, floor).length === 0;
}

export function recordDefeatedBoss(floorState, floor, enemyId) {
  if (!floorState || !enemyId) return [];
  const defeated = getDefeatedBossIds(floorState, floor);
  defeated.add(enemyId);
  floorState.defeatedBossIds = [...defeated];
  const remaining = getRemainingExitGuardianIds(floorState, floor);
  // Keep the legacy boolean as a compatibility/cache field. It now means
  // "all configured exit guardians are defeated", not "some boss died".
  floorState.bossDefeated = remaining.length === 0;
  return remaining;
}

function normalizeCardRequirements(requirements) {
  if (!requirements || typeof requirements !== 'object' || Array.isArray(requirements)) return null;
  const normalized = {};
  for (const [card, amount] of Object.entries(requirements)) {
    const count = Math.max(0, Math.floor(Number(amount) || 0));
    if (count > 0) normalized[card] = count;
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function getCardGateRequirements(floor, gateId) {
  const explicit = normalizeCardRequirements(floor?.puzzles?.cardGates?.[gateId]);
  if (explicit) return explicit;
  // Compatibility with the historical F7 three-spectrum gate. New content
  // should prefer puzzles.cardGates so Sun can remain truly rare.
  if (floor?.puzzles?.triGate === gateId) return { sun: 1, moon: 1, star: 1 };
  return null;
}

export function getMissingCards(cards, requirements) {
  if (!requirements) return [];
  const missing = [];
  for (const [card, amount] of Object.entries(requirements)) {
    const owned = Math.max(0, Number(cards?.[card]) || 0);
    if (owned < amount) missing.push({ card, required: amount, owned, missing: amount - owned });
  }
  return missing;
}

export function consumeCardRequirements(cards, requirements) {
  const missing = getMissingCards(cards, requirements);
  if (missing.length > 0) return { ok: false, missing };
  for (const [card, amount] of Object.entries(requirements ?? {})) cards[card] -= amount;
  return { ok: true, missing: [] };
}

export function getGuardianGateRequirements(floor, gateId) {
  const ids = floor?.puzzles?.guardianGates?.[gateId];
  return Array.isArray(ids) ? uniqueIds(ids) : null;
}

export function getMissingGuardianIds(floorState, floor, gateId) {
  const required = getGuardianGateRequirements(floor, gateId);
  if (!required) return [];
  const defeated = getDefeatedBossIds(floorState, floor);
  return required.filter((enemyId) => !defeated.has(enemyId));
}
