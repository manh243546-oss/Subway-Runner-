/**
 * 3D Spatial Partitioning Node Grid for O(1) Ultra-Fast Collision Query
 * Groups game entities into Z-axis chunk buckets and lane spatial nodes.
 */

export interface SpatialEntity {
  id: string;
  lane: number;
  positionZ: number;
  positionY?: number;
  radiusZ: number;
  active: boolean;
}

export class SpatialHashGrid3D<T extends SpatialEntity> {
  private cellSize: number;
  private grid: Map<number, Set<T>> = new Map();

  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
  }

  private getKey(z: number): number {
    return Math.floor(z / this.cellSize);
  }

  /**
   * Clear spatial nodes
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Insert entity into spatial node grid bucket(s)
   */
  insert(entity: T): void {
    if (!entity.active) return;

    const minKey = this.getKey(entity.positionZ - entity.radiusZ);
    const maxKey = this.getKey(entity.positionZ + entity.radiusZ);

    for (let key = minKey; key <= maxKey; key++) {
      let bucket = this.grid.get(key);
      if (!bucket) {
        bucket = new Set<T>();
        this.grid.set(key, bucket);
      }
      bucket.add(entity);
    }
  }

  /**
   * Get nearby candidate entities in player's spatial node range
   */
  getNearby(playerZ: number, searchRangeZ: number = 15): T[] {
    const minKey = this.getKey(playerZ - searchRangeZ);
    const maxKey = this.getKey(playerZ + searchRangeZ);
    const results: Set<T> = new Set();

    for (let key = minKey; key <= maxKey; key++) {
      const bucket = this.grid.get(key);
      if (bucket) {
        for (const item of bucket) {
          if (item.active) {
            results.add(item);
          }
        }
      }
    }

    return Array.from(results);
  }

  /**
   * Return number of active node cells
   */
  getActiveCellCount(): number {
    return this.grid.size;
  }
}
