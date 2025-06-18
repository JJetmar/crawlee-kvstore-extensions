// @ts-ignore
import { describe, test, vi, beforeEach, expect } from 'vitest';
import { cacheKeyValueStore } from '../src/index.js';

describe('Testing EncryptedKeyValueStore', () => {
    const mockedKeyValueStore = {
        getValue: vi.fn(),
        setValue: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();
    })

    test("Set null value to null value", async () => {
        const cachedKeyValueStore = cacheKeyValueStore(mockedKeyValueStore);
        await cachedKeyValueStore.setValue('UNEXISTING_KEY', null);

        expect(mockedKeyValueStore.setValue).toBeCalledTimes(0);
    });

    test("Get cached value", async () => {
        const cachedKeyValueStore = cacheKeyValueStore(mockedKeyValueStore);
        await cachedKeyValueStore.getValue('UNEXISTING_KEY');

        expect(mockedKeyValueStore.getValue).toBeCalledTimes(1);

        await cachedKeyValueStore.setValue('KEY_TO_BE_CACHED', 'CACHED_VALUE');
        expect(mockedKeyValueStore.setValue).toBeCalledTimes(1);

        await cachedKeyValueStore.getValue('KEY_TO_BE_CACHED');
        expect(mockedKeyValueStore.getValue).toBeCalledTimes(1);

        await cachedKeyValueStore.getValue('KEY_TO_BE_CACHED');
        expect(mockedKeyValueStore.getValue).toBeCalledTimes(1);
    });

    test("Get cached value", async () => {
        const cachedKeyValueStore = cacheKeyValueStore(mockedKeyValueStore);
        await cachedKeyValueStore.getValue('UNEXISTING_KEY');

        expect(mockedKeyValueStore.getValue).toBeCalledTimes(1);

        await cachedKeyValueStore.setValue('KEY_TO_BE_CACHED', 'CACHED_VALUE');
        expect(mockedKeyValueStore.setValue).toBeCalledTimes(1);

        await cachedKeyValueStore.getValue('KEY_TO_BE_CACHED');
        expect(mockedKeyValueStore.getValue).toBeCalledTimes(1);

        await cachedKeyValueStore.setValue('KEY_TO_BE_CACHED', 'ANOTHER_CACHED_VALUE');
        expect(mockedKeyValueStore.setValue).toBeCalledTimes(2);

        await cachedKeyValueStore.getValue('KEY_TO_BE_CACHED');
        expect(mockedKeyValueStore.getValue).toBeCalledTimes(1);
    });
});
