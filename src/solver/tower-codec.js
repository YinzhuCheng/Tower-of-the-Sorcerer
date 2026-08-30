const DYNAMIC_TYPES = new Set(['item', 'door', 'switch', 'gate', 'enemy']);

function parseTokenLocal(token) {
  const separator = token.indexOf(':');
  if (separator < 0) return { type: token, id: null };
  return { type: token.slice(0, separator), id: token.slice(separator + 1) };
}

function cloneMap(map) {
  return map.map((row) => [...row]);
}

function transitToken(token) {
  return token === '.' || token === 'S' || token === 'shop';
}

function componentAnchor(engineState) {
  const floorState = engineState.floorStates[engineState.floor];
  const map = floorState.map;
  const height = map.length;
  const width = Math.max(...map.map((row) => row.length));
  const queue = [{ x: engineState.x, y: engineState.y }];
  let head = 0;
  const seen = new Set([`${engineState.x},${engineState.y}`]);
  let anchor = engineState.y * width + engineState.x;

  while (head < queue.length) {
    const current = queue[head++];
    anchor = Math.min(anchor, current.y * width + current.x);
    const neighbors = [
      [current.x, current.y - 1],
      [current.x, current.y + 1],
      [current.x - 1, current.y],
      [current.x + 1, current.y]
    ];
    for (const [x, y] of neighbors) {
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const key = `${x},${y}`;
      if (seen.has(key) || !transitToken(map[y]?.[x] ?? '#')) continue;
      seen.add(key);
      queue.push({ x, y });
    }
  }
  return anchor;
}

function semanticEventId(floorNumber, parsed, occurrence) {
  const semantic = parsed.id ?? parsed.type;
  return `f${floorNumber}:${parsed.type}:${semantic}#${occurrence}`;
}

export function createTowerStateCodec({ baseState, floors, enemies }) {
  const slots = [];
  const slotByCoordinate = new Map();
  const occurrenceCounters = new Map();

  for (let floorIndex = 0; floorIndex < baseState.floorStates.length; floorIndex += 1) {
    const map = baseState.floorStates[floorIndex].map;
    const floorNumber = floors[floorIndex]?.number ?? floorIndex + 1;
    for (let y = 0; y < map.length; y += 1) {
      for (let x = 0; x < map[y].length; x += 1) {
        const token = map[y][x];
        const parsed = parseTokenLocal(token);
        if (!DYNAMIC_TYPES.has(parsed.type)) continue;
        const counterKey = `${floorIndex}:${parsed.type}:${parsed.id ?? ''}`;
        const occurrence = (occurrenceCounters.get(counterKey) ?? 0) + 1;
        occurrenceCounters.set(counterKey, occurrence);
        const slot = {
          index: slots.length,
          floor: floorIndex,
          x,
          y,
          initialToken: token,
          eventId: semanticEventId(floorNumber, parsed, occurrence),
          type: parsed.type,
          semanticId: parsed.id
        };
        slots.push(slot);
        slotByCoordinate.set(`${floorIndex}:${x},${y}`, slot);
      }
    }
  }

  const tokenToCode = new Map();
  const codeToToken = [];
  const registerToken = (token) => {
    if (tokenToCode.has(token)) return tokenToCode.get(token);
    const code = codeToToken.length;
    tokenToCode.set(token, code);
    codeToToken.push(token);
    return code;
  };
  registerToken('.');
  for (const slot of slots) registerToken(slot.initialToken);
  for (const enemyId of Object.keys(enemies)) registerToken(`enemy:${enemyId}`);

  const initialEventStates = slots.map((slot) => registerToken(slot.initialToken));
  const baseMaps = baseState.floorStates.map((floorState) => cloneMap(floorState.map));
  const baseStart = { ...baseState.start };
  const bossIdsByFloor = baseState.floorStates.map((_, floorIndex) => {
    const floorNumber = floors[floorIndex]?.number ?? floorIndex + 1;
    const ids = Object.entries(enemies)
      .filter(([, enemy]) => enemy?.boss && enemy.floor === floorNumber)
      .map(([id]) => id);
    for (const slot of slots) {
      if (slot.floor !== floorIndex || slot.type !== 'enemy') continue;
      if (enemies[slot.semanticId]?.boss) ids.push(slot.semanticId);
    }
    return [...new Set(ids)].sort();
  });
  const bossIndexByFloor = bossIdsByFloor.map((ids) => new Map(ids.map((id, index) => [id, index])));

  function encodeDefeatedBossMask(floorIndex, ids = []) {
    let mask = 0n;
    for (const id of ids) {
      const index = bossIndexByFloor[floorIndex]?.get(id);
      if (index == null) {
        throw new Error(`Tower codec cannot encode unknown boss progress '${id}' on floor ${floorIndex + 1}.`);
      }
      mask |= 1n << BigInt(index);
    }
    return mask.toString(36);
  }

  function decodeDefeatedBossMask(floorIndex, encoded = '0') {
    let mask = 0n;
    for (const character of String(encoded).toLowerCase()) {
      const digit = '0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(character);
      if (digit < 0) throw new Error(`Tower codec encountered invalid boss-progress mask '${encoded}'.`);
      mask = mask * 36n + BigInt(digit);
    }
    const ids = [];
    for (let index = 0; mask > 0n; index += 1) {
      if ((mask & 1n) === 1n && bossIdsByFloor[floorIndex]?.[index]) ids.push(bossIdsByFloor[floorIndex][index]);
      mask >>= 1n;
    }
    return ids;
  }

  function encodeToken(token) {
    const code = tokenToCode.get(token);
    if (code == null) {
      throw new Error(`Tower codec encountered an unregistered dynamic token: ${token}`);
    }
    return code;
  }

  function compact(engineState) {
    const eventStates = new Array(slots.length);
    for (const slot of slots) {
      eventStates[slot.index] = encodeToken(engineState.floorStates[slot.floor].map[slot.y][slot.x]);
    }
    return {
      solverStateVersion: 1,
      version: engineState.version,
      floor: engineState.floor,
      x: engineState.x,
      y: engineState.y,
      start: { ...engineState.start },
      stats: { ...engineState.stats },
      cards: { ...engineState.cards },
      magic: { ...engineState.magic },
      relics: { ...engineState.relics },
      cores: engineState.cores,
      shopPurchases: engineState.shopPurchases,
      eventStates,
      floorMeta: engineState.floorStates.map((floorState, floorIndex) => ({
        switches: [...floorState.switches].sort(),
        sequenceProgress: floorState.sequenceProgress,
        bossDefeated: floorState.bossDefeated,
        // A boolean is insufficient for a multi-guardian exit: each defeated
        // ID changes the future gate state. Losing this list made a compact
        // solver state forget partial boss progress after materialization.
        defeatedBossMask: encodeDefeatedBossMask(floorIndex, floorState.defeatedBossIds ?? [])
      })),
      visitedFloors: [...engineState.visitedFloors].sort((a, b) => a - b),
      victory: Boolean(engineState.victory),
      componentAnchor: componentAnchor(engineState)
    };
  }

  function isCompact(state) {
    return state?.solverStateVersion === 1 && Array.isArray(state.eventStates);
  }

  function cloneCompact(state) {
    const compactState = isCompact(state) ? state : compact(state);
    return {
      ...compactState,
      start: { ...compactState.start },
      stats: { ...compactState.stats },
      cards: { ...compactState.cards },
      magic: { ...compactState.magic },
      relics: { ...compactState.relics },
      eventStates: [...compactState.eventStates],
      floorMeta: compactState.floorMeta.map((meta) => ({
        switches: [...meta.switches],
        sequenceProgress: meta.sequenceProgress,
        bossDefeated: meta.bossDefeated,
        defeatedBossMask: meta.defeatedBossMask ?? '0'
      })),
      visitedFloors: [...compactState.visitedFloors]
    };
  }

  function materialize(state) {
    if (!isCompact(state)) return state;
    const floorStates = baseMaps.map((map, floorIndex) => ({
      map: cloneMap(map),
      switches: [...state.floorMeta[floorIndex].switches],
      sequenceProgress: state.floorMeta[floorIndex].sequenceProgress,
      bossDefeated: state.floorMeta[floorIndex].bossDefeated,
      defeatedBossIds: decodeDefeatedBossMask(floorIndex, state.floorMeta[floorIndex].defeatedBossMask)
    }));
    for (const slot of slots) {
      floorStates[slot.floor].map[slot.y][slot.x] = codeToToken[state.eventStates[slot.index]];
    }
    return {
      version: state.version,
      floor: state.floor,
      x: state.x,
      y: state.y,
      start: { ...state.start },
      stats: { ...state.stats },
      cards: { ...state.cards },
      magic: { ...state.magic },
      relics: { ...state.relics },
      relicNames: [],
      cores: state.cores,
      shopPurchases: state.shopPurchases,
      floorStates,
      visitedFloors: [...state.visitedFloors],
      storySeen: [],
      seenEnemies: [],
      turns: 0,
      battles: 0,
      victory: state.victory,
      logs: []
    };
  }

  function changedEventSignature(state) {
    const compactState = isCompact(state) ? state : compact(state);
    const changed = [];
    for (let index = 0; index < compactState.eventStates.length; index += 1) {
      const code = compactState.eventStates[index];
      if (code !== initialEventStates[index]) changed.push(`${index}:${code}`);
    }
    return changed.join(',');
  }

  function eventIdAt(floor, x, y, token = null) {
    const slot = slotByCoordinate.get(`${floor}:${x},${y}`);
    if (slot) return slot.eventId;
    const parsed = parseTokenLocal(token ?? '');
    const floorNumber = floors[floor]?.number ?? floor + 1;
    if (token === 'U') return `f${floorNumber}:stairs:up`;
    if (token === 'D') return `f${floorNumber}:stairs:down`;
    if (parsed.type === 'rune') return `f${floorNumber}:rune:${parsed.id}`;
    return `f${floorNumber}:${parsed.type}:${parsed.id ?? parsed.type}:${x},${y}`;
  }

  function eventCatalogSummary() {
    const counts = {};
    for (const slot of slots) counts[slot.type] = (counts[slot.type] ?? 0) + 1;
    return {
      schemaVersion: 1,
      dynamicSlots: slots.length,
      tokenVocabulary: codeToToken.length,
      counts,
      events: slots.map(({ eventId, floor, x, y, type, semanticId }) => ({
        eventId, floor, x, y, type, semanticId
      }))
    };
  }

  function tokenForCode(code) {
    if (!Number.isInteger(code) || code < 0 || code >= codeToToken.length) {
      throw new Error(`Tower codec token code out of range: ${code}`);
    }
    return codeToToken[code];
  }

  return {
    schemaVersion: 1,
    stateEncoding: 'event-vector-v1',
    slots,
    initialEventStates,
    compact,
    cloneCompact,
    materialize,
    isCompact,
    changedEventSignature,
    eventIdAt,
    eventCatalogSummary,
    tokenForCode,
    tokenVocabularySize: codeToToken.length,
    baseStart
  };
}
