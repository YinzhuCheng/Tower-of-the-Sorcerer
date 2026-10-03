export const DEFAULT_RESOURCE_FIELDS = [
  'hp', 'maxHp', 'atk', 'def', 'gold', 'sun', 'moon', 'star', 'break'
];

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function hashString(input) {
  // 64-bit FNV-1a. This is an identity checksum, not a cryptographic signature.
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.codePointAt(index);
    hash ^= BigInt(code);
    hash = BigInt.asUintN(64, hash * prime);
    if (code > 0xffff) index += 1;
  }
  return hash.toString(16).padStart(16, '0');
}

export function hashValue(value) {
  return hashString(stableStringify(value));
}

export function normalizeResourceLabel(resource = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(resource)) {
    if (value !== undefined) normalized[key] = Number(value);
  }
  return normalized;
}

export function resourceRelation(left, right, fields = null) {
  const keys = fields ?? [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  let leftStrict = false;
  let rightStrict = false;

  for (const key of keys) {
    const a = Number(left[key] ?? 0);
    const b = Number(right[key] ?? 0);
    if (a > b) leftStrict = true;
    if (a < b) rightStrict = true;
    if (leftStrict && rightStrict) return 'incomparable';
  }

  if (!leftStrict && !rightStrict) return 'equal';
  return leftStrict ? 'dominates' : 'dominated';
}

export function dominates(left, right, fields = null, { allowEqual = false } = {}) {
  const relation = resourceRelation(left, right, fields);
  return relation === 'dominates' || (allowEqual && relation === 'equal');
}

export function resourceDistance(left, right, fields = null) {
  const keys = fields ?? [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  const delta = {};
  for (const key of keys) delta[key] = Number(left[key] ?? 0) - Number(right[key] ?? 0);
  return delta;
}
