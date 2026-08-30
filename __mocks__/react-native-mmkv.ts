class MockMMKV {
  private storage: Map<string, string> = new Map();

  getString(key: string): string | undefined {
    return this.storage.get(key);
  }

  set(key: string, value: string): void {
    this.storage.set(key, value);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clearAll(): void {
    this.storage.clear();
  }
}

export const createMMKV = () => new MockMMKV();
