export const WALL_BITS = Object.freeze({
  north: 1,
  east: 2,
  south: 4,
  west: 8
});

function countBits(mask) {
  let value = mask & 15;
  let count = 0;
  while (value) {
    count += value & 1;
    value >>= 1;
  }
  return count;
}

export function selectWallVisual(mask) {
  const value = mask & 15;
  const count = countBits(value);

  if (value === 10) return Object.freeze({ asset: 'wall-horizontal', rotation: 0, scale: 1.18 });
  if (value === 5) return Object.freeze({ asset: 'wall-vertical', rotation: 0, scale: 1.18 });

  if (count === 1) {
    const rotation = {
      8: 0,
      2: Math.PI,
      1: Math.PI / 2,
      4: -Math.PI / 2
    }[value] ?? 0;
    return Object.freeze({ asset: 'wall-end-cap', rotation, scale: 1.12 });
  }

  // A bend gets an ornate corner pillar. Adjacent straight pieces overlap slightly
  // into this cell, so the pillar visually welds the two directions without a
  // visible tile seam or an isometric diagonal mismatch.
  if (count === 2) {
    return Object.freeze({ asset: 'wall-pillar', rotation: 0, scale: 1.02 });
  }

  if (count === 3) {
    const rotation = {
      14: 0,
      11: Math.PI,
      7: Math.PI / 2,
      13: -Math.PI / 2
    }[value] ?? 0;
    return Object.freeze({ asset: 'wall-t-junction', rotation, scale: 1.08 });
  }

  if (count === 4) return Object.freeze({ asset: 'wall-body', rotation: 0, scale: 1.04 });
  return Object.freeze({ asset: 'wall-pillar', rotation: 0, scale: 1.02 });
}
