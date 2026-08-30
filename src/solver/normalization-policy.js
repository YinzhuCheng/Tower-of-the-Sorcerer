// Only events proven monotone and order-safe under the current canonical rules
// may enter the automatic closure. Unknown/future item kinds stay explicit.
export const AUTOMATIC_ITEM_PRIORITY = [
  'hpLarge', 'hp', 'atk', 'def', 'dual', 'weapon', 'shield',
  'codex', 'compass', 'lucky', 'ward', 'sun', 'moon', 'star',
  // Act III stat/MP pickups remain monotone.  The charter side rooms are
  // still a deliberate gate-and-battle choice; once reached, declining their
  // published reward creates no compensating option and only bloats search.
  'act3Restorative', 'act3Hp', 'act3Atk', 'act3Def', 'act3Dual', 'act3Mana',
  'shelterAegis', 'auditLedger', 'relayCapacitor'
];

export function automaticItemRank(itemId) {
  return AUTOMATIC_ITEM_PRIORITY.indexOf(itemId);
}

export function isSafeAutomaticItem(itemId) {
  return automaticItemRank(itemId) >= 0;
}
