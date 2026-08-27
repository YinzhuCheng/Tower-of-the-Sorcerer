const DEFAULT_STATE_KEYS = Object.freeze([
  'lost-magic-tower:manual:v1',
  'lost-magic-tower:auto:v1'
]);

const STORAGE_SCOPE_MARKER = Symbol.for('lost-magic-tower:content-storage-scope');

export function contentScopedStorageKey(key, contentId, stateKeys = DEFAULT_STATE_KEYS) {
  if (!contentId || !stateKeys.includes(key)) return key;
  const suffix = key.slice('lost-magic-tower:'.length);
  return `lost-magic-tower:${contentId}:${suffix}`;
}

export function installContentStorageScope({
  contentId,
  storagePrototype = globalThis.Storage?.prototype,
  stateKeys = DEFAULT_STATE_KEYS
} = {}) {
  if (!contentId || !storagePrototype) return { installed: false, contentId: contentId ?? null };

  const existing = storagePrototype[STORAGE_SCOPE_MARKER];
  if (existing) {
    if (existing.contentId !== contentId) {
      throw new Error(`Storage scope already installed for ${existing.contentId}; refusing ${contentId}.`);
    }
    return { installed: false, contentId };
  }

  const nativeGetItem = storagePrototype.getItem;
  const nativeSetItem = storagePrototype.setItem;
  const nativeRemoveItem = storagePrototype.removeItem;
  if (![nativeGetItem, nativeSetItem, nativeRemoveItem].every((method) => typeof method === 'function')) {
    throw new Error('Storage scope requires getItem/setItem/removeItem methods.');
  }

  const mapKey = (key) => contentScopedStorageKey(String(key), contentId, stateKeys);
  Object.defineProperties(storagePrototype, {
    getItem: {
      configurable: true,
      writable: true,
      value(key) { return nativeGetItem.call(this, mapKey(key)); }
    },
    setItem: {
      configurable: true,
      writable: true,
      value(key, value) { return nativeSetItem.call(this, mapKey(key), value); }
    },
    removeItem: {
      configurable: true,
      writable: true,
      value(key) { return nativeRemoveItem.call(this, mapKey(key)); }
    },
    [STORAGE_SCOPE_MARKER]: {
      configurable: false,
      writable: false,
      value: Object.freeze({ contentId, stateKeys: [...stateKeys] })
    }
  });

  return { installed: true, contentId };
}
