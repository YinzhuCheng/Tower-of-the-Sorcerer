import { FLOORS } from '../game/data.js';

const TOPOLOGY_SLOT_SPECS = Object.freeze({
  8: Object.freeze({
    walls: Object.freeze({
      wallNwBridge: Object.freeze({ x: 2, y: 4, expected: '#' }),
      wallMidWest: Object.freeze({ x: 4, y: 5, expected: '#' }),
      wallMidLower: Object.freeze({ x: 6, y: 7, expected: '#' }),
      wallEastLower: Object.freeze({ x: 8, y: 8, expected: '#' })
    }),
    opens: Object.freeze({
      floorNorthCenter: Object.freeze({ x: 4, y: 3, expected: '.' }),
      floorMidCenter: Object.freeze({ x: 6, y: 5, expected: '.' }),
      floorLowerCenter: Object.freeze({ x: 5, y: 7, expected: '.' }),
      floorLowerEast: Object.freeze({ x: 7, y: 9, expected: '.' })
    })
  }),
  9: Object.freeze({
    walls: Object.freeze({
      wallNwBridge: Object.freeze({ x: 2, y: 4, expected: '#' }),
      wallMidNorth: Object.freeze({ x: 4, y: 4, expected: '#' }),
      wallMidLower: Object.freeze({ x: 6, y: 7, expected: '#' }),
      wallEastLower: Object.freeze({ x: 8, y: 8, expected: '#' })
    }),
    opens: Object.freeze({
      floorNorthCenter: Object.freeze({ x: 4, y: 3, expected: '.' }),
      floorMidCenter: Object.freeze({ x: 6, y: 5, expected: '.' }),
      floorLowerCenter: Object.freeze({ x: 5, y: 7, expected: '.' }),
      floorLowerEast: Object.freeze({ x: 9, y: 9, expected: '.' })
    })
  })
});

function floorByNumber(number) {
  const floor = FLOORS.find((entry) => entry.number === number);
  if (!floor) throw new Error(`10F topology mutation requires floor ${number}.`);
  return floor;
}

function resolveSlot(floorNumber, kind, slotId) {
  const spec = TOPOLOGY_SLOT_SPECS[floorNumber]?.[kind]?.[slotId];
  if (!spec) throw new Error(`Unknown topology slot: f${floorNumber}.${kind}.${slotId}`);
  const floor = floorByNumber(floorNumber);
  const actual = floor.map[spec.y]?.[spec.x];
  if (actual !== spec.expected) {
    throw new Error(`Topology slot drift: f${floorNumber}.${slotId} expected ${spec.expected}, got ${actual}`);
  }
  return Object.freeze({ floor: floorNumber, slotId, x: spec.x, y: spec.y, baselineToken: actual });
}

export function createDemoTenFloorTopologyMutationCatalog() {
  const mutations = [];
  for (const floorNumber of [8, 9]) {
    const wallIds = Object.keys(TOPOLOGY_SLOT_SPECS[floorNumber].walls);
    const openIds = Object.keys(TOPOLOGY_SLOT_SPECS[floorNumber].opens);
    for (const wallId of wallIds) {
      for (const openId of openIds) {
        const wall = resolveSlot(floorNumber, 'walls', wallId);
        const open = resolveSlot(floorNumber, 'opens', openId);
        mutations.push(Object.freeze({
          id: `f${floorNumber}-topology-${wallId}-${openId}`,
          kind: 'topology-wall-floor-swap',
          floor: floorNumber,
          wall,
          open,
          editCount: 1
        }));
      }
    }
  }
  return Object.freeze(mutations);
}

export function withDemoTenFloorTopologyMutation(mutation, evaluate) {
  if (!mutation || mutation.kind !== 'topology-wall-floor-swap') {
    throw new Error('A topology-wall-floor-swap mutation is required.');
  }
  if (typeof evaluate !== 'function') throw new Error('Topology evaluation callback is required.');
  const floor = floorByNumber(mutation.floor);
  const wallToken = floor.map[mutation.wall.y]?.[mutation.wall.x];
  const openToken = floor.map[mutation.open.y]?.[mutation.open.x];
  if (wallToken !== '#' || openToken !== '.') {
    throw new Error(`Topology slot drift for ${mutation.id}: ${wallToken}/${openToken}`);
  }
  try {
    floor.map[mutation.wall.y][mutation.wall.x] = '.';
    floor.map[mutation.open.y][mutation.open.x] = '#';
    return evaluate();
  } finally {
    floor.map[mutation.wall.y][mutation.wall.x] = wallToken;
    floor.map[mutation.open.y][mutation.open.x] = openToken;
  }
}

export function describeDemoTenFloorTopologySlots() {
  return TOPOLOGY_SLOT_SPECS;
}
