/**
 * RealtySoft Widget v3 - LRU Cache
 * Generic in-memory LRU cache using doubly-linked list + Map for O(1) operations
 */

interface LRUNode<T> {
  key: string;
  value: T;
  prev: LRUNode<T> | null;
  next: LRUNode<T> | null;
}

export class LRUCache<T> {
  private capacity: number;
  private map: Map<string, LRUNode<T>>;
  private head: LRUNode<T> | null;
  private tail: LRUNode<T> | null;

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
    this.map = new Map();
    this.head = null;
    this.tail = null;
  }

  get size(): number {
    return this.map.size;
  }

  get(key: string): T | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.moveToHead(node);
    return node.value;
  }

  set(key: string, value: T): void {
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      this.moveToHead(existing);
      return;
    }

    const node: LRUNode<T> = { key, value, prev: null, next: null };
    this.map.set(key, node);
    this.addToHead(node);

    if (this.map.size > this.capacity) {
      this.evict();
    }
  }

  delete(key: string): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.removeNode(node);
    this.map.delete(key);
    return true;
  }

  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  /**
   * Iterate over all entries in the cache
   */
  forEach(callback: (value: T, key: string) => void): void {
    this.map.forEach((node, key) => {
      callback(node.value, key);
    });
  }

  /**
   * Get all keys in the cache
   */
  keys(): string[] {
    return Array.from(this.map.keys());
  }

  private addToHead(node: LRUNode<T>): void {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: LRUNode<T>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
    node.prev = null;
    node.next = null;
  }

  private moveToHead(node: LRUNode<T>): void {
    if (this.head === node) return;
    this.removeNode(node);
    this.addToHead(node);
  }

  private evict(): void {
    if (!this.tail) return;
    const evicted = this.tail;
    this.removeNode(evicted);
    this.map.delete(evicted.key);
  }
}
