const localStorageStore: Record<string, string> = {};
const localStorageMock = {
    getItem: (key: string) => localStorageStore[key] || null,
    setItem: (key: string, value: string) => {
        localStorageStore[key] = value.toString();
    },
    clear: () => {
        Object.keys(localStorageStore).forEach((key) => delete localStorageStore[key]);
    },
    removeItem: (key: string) => {
        delete localStorageStore[key];
    },
};
Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
});
