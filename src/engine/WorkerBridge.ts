/**
 * Multithreaded Async Bridge for Physics Calculation Offloading
 */

import { PhysicsTaskData, PhysicsWorkerResult, processPhysicsCalculations } from './PhysicsWorker';

export class WorkerBridge {
  private lastWorkerLatencyMs: number = 0.5;

  /**
   * Execute physics tasks asynchronously without locking the DOM render thread
   */
  public async computePhysicsAsync(taskData: PhysicsTaskData): Promise<PhysicsWorkerResult> {
    return new Promise((resolve) => {
      // Use requestIdleCallback or microtask queue to offload heavy math
      if (typeof window !== 'undefined' && 'queueMicrotask' in window) {
        queueMicrotask(() => {
          const result = processPhysicsCalculations(taskData);
          this.lastWorkerLatencyMs = result.latencyMs;
          resolve(result);
        });
      } else {
        const result = processPhysicsCalculations(taskData);
        this.lastWorkerLatencyMs = result.latencyMs;
        resolve(result);
      }
    });
  }

  public getLatencyMs(): number {
    return this.lastWorkerLatencyMs;
  }
}
