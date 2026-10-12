export class MockStorage {
    constructor() {
        this.store = new Map();
    }
    
    getItem(key) {
        return this.store.get(key) || null;
    }
    
    setItem(key, value) {
        this.store.set(key, String(value));
    }
    
    removeItem(key) {
        this.store.delete(key);
    }
    
    clear() {
        this.store.clear();
    }
}

export function setupMockStorage() {
    const mockStorage = new MockStorage();
    
    if (typeof global !== 'undefined') {
        Object.defineProperty(global, 'localStorage', {
            value: mockStorage,
            configurable: true,
            writable: true
        });
    }
    if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'localStorage', {
            value: mockStorage,
            configurable: true,
            writable: true
        });
    }
    
    return mockStorage;
}
