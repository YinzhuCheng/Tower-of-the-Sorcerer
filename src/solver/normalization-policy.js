// Only events proven monotone and order-safe under the current canonical rules
// may enter the automatic closure. Unknown/future item kinds stay explicit.
export const AUTOMATIC_ITEM_PRIORITY = [
  'hpLarge', 'hp', 'atk', 'def', 'dual', 'weapon', 'shield',
  'codex', 'compass', 'lucky', 'ward', 'sun', 'moon', 'star'
];

export function automaticItemRank(itemId) {
  return AUTOMATIC_ITEM_PRIORITY.indexOf(itemId);
}

export function isSafeAutomaticItem(itemId) {
  return automaticItemRank(itemId) >= 0;
}
