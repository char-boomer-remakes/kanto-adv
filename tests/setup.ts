// Minimal in-memory localStorage shim so the save-slot helpers in src/game.ts
// (currentSlot / setSlot / slotMeta) can run under the Node test environment.
// Browser tests exercise the real thing; here we just need get/set/clear.
class MemoryStorage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void { this.store.set(key, String(value)); }
  removeItem(key: string): void { this.store.delete(key); }
  clear(): void { this.store.clear(); }
  key(i: number): string | null { return [...this.store.keys()][i] ?? null; }
}

// Always install our own — newer Node ships an experimental `localStorage` that
// needs a backing file and lacks `clear()`, which trips up the save helpers.
Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  writable: true,
  configurable: true,
});
