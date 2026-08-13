/**
 * High-Performance Generic Object Pool Pattern
 * Prevents Garbage Collection (GC) pauses during 60/120 FPS gameplay.
 */

export interface Poolable {
  active: boolean;
  reset?(): void;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[] = [];
  private activeObjects: Set<T> = new Set();
  private factory: () => T;
  private resetFn?: (item: T) => void;

  constructor(factory: () => T, initialSize: number = 50, resetFn?: (item: T) => void) {
    this.factory = factory;
    this.resetFn = resetFn;
    for (let i = 0; i < initialSize; i++) {
      const obj = this.factory();
      obj.active = false;
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  /**
   * Acquire an object from the pool or create a new one if pool is exhausted
   */
  acquire(): T {
    let obj: T;
    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else {
      obj = this.factory();
    }

    // Reset object state FIRST before setting active = true
    if (this.resetFn) {
      this.resetFn(obj);
    } else if (obj.reset) {
      obj.reset();
    }

    obj.active = true;
    this.activeObjects.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.activeObjects.has(obj)) return;

    obj.active = false;
    if (this.resetFn) {
      this.resetFn(obj);
    } else if (obj.reset) {
      obj.reset();
    }
    this.activeObjects.delete(obj);
    this.pool.push(obj);
  }

  /**
   * Release all active objects back into available pool
   */
  releaseAll(): void {
    for (const obj of this.activeObjects) {
      obj.active = false;
      if (this.resetFn) {
        this.resetFn(obj);
      } else if (obj.reset) {
        obj.reset();
      }
      this.pool.push(obj);
    }
    this.activeObjects.clear();
  }

  /**
   * Get current pool telemetry
   */
  getStats(): { active: number; available: number; total: number } {
    return {
      active: this.activeObjects.size,
      available: this.pool.length,
      total: this.activeObjects.size + this.pool.length,
    };
  }
}
