import type { KeyValueStoreLike } from './types.js';

import { EncryptedKeyValueStore } from './key-value-store/encrypted-key-value-store.js'
import { CachedKeyValueStore } from './cached-key-value-store.js'

export { CachedKeyValueStore } from './cached-key-value-store.js'
export { EncryptedKeyValueStore } from './key-value-store/encrypted-key-value-store.js'

export function encryptKeyValueStore(keyValueStore: KeyValueStoreLike, secretKey: string): EncryptedKeyValueStore {
    return new EncryptedKeyValueStore(keyValueStore, secretKey);
}

export function cacheKeyValueStore(keyValueStore: KeyValueStoreLike): CachedKeyValueStore {
    return new CachedKeyValueStore(keyValueStore);
}
