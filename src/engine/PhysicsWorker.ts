/**
 * Web Worker for Offloading Physics, Curve Math & Collision Candidate Filtering
 * Offloads CPU intensive calculation loops from the main 60/120 FPS render thread.
 */

export interface PhysicsTaskData {
  playerPos: { x: number; y: number; z: number; lane: number };
  playerSize: { width: number; height: number; length: number };
  isRolling?: boolean;
  hasMagnet: boolean;
  hasJetpack?: boolean;
  magnetRadius: number;
  coins: Array<{ id: string; x: number; y: number; z: number; lane: number; active: boolean }>;
  obstacles: Array<{ id: string; type: string; lane: number; z: number; height: number; length: number; active: boolean }>;
}

export interface PhysicsWorkerResult {
  collisions: string[]; // obstacle IDs collided
  coinsCollected: string[]; // coin IDs collected
  magneticCoinsUpdated: Array<{ id: string; newX: number; newY: number; newZ: number }>;
  latencyMs: number;
}

/**
 * Executes physics and spatial node checks
 */
export function processPhysicsCalculations(data: PhysicsTaskData): PhysicsWorkerResult {
  const startTime = performance.now();
  const { playerPos, playerSize, hasMagnet, magnetRadius, coins, obstacles } = data;

  const collisions: string[] = [];
  const coinsCollected: string[] = [];
  const magneticCoinsUpdated: Array<{ id: string; newX: number; newY: number; newZ: number }> = [];

  const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };
  const playerX = playerPos.x;
  const playerY = playerPos.y;
  const playerZ = playerPos.z;

  // 1. Process Coins (Magnetic pull + Collection check)
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    if (!coin.active) continue;

    const coinX = laneXMap[coin.lane] ?? 0;
    const coinY = coin.y;
    const coinZ = coin.z;

    const dx = playerX - coinX;
    const dy = playerY - coinY;
    const dz = playerZ - coinZ;
    const distSq = dx * dx + dy * dy + dz * dz;

    // Check collection (Radius ~ 1.2m)
    if (distSq < 1.44) {
      coinsCollected.push(coin.id);
      continue;
    }

    // Magnetic attraction pull
    if (hasMagnet && distSq < magnetRadius * magnetRadius) {
      const dist = Math.sqrt(distSq);
      const lerpSpeed = 0.25 * (1 - dist / magnetRadius);
      const newX = coinX + dx * lerpSpeed;
      const newY = coinY + dy * lerpSpeed;
      const newZ = coinZ + dz * lerpSpeed;

      magneticCoinsUpdated.push({
        id: coin.id,
        newX,
        newY,
        newZ,
      });
    }
  }

  // 2. Process Obstacles AABB Collision Check
  const halfW = playerSize.width / 2;
  const halfH = playerSize.height / 2;
  const halfL = playerSize.length / 2;

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (!obs.active) continue;

    const obsX = laneXMap[obs.lane] ?? 0;
    const obsY = obs.height / 2;
    const obsZ = obs.z;

    const obsHalfW = 0.9;
    const obsHalfH = obs.height / 2;
    const obsHalfL = obs.length / 2;

    // AABB Overlap check
    const overlapX = Math.abs(playerX - obsX) < halfW + obsHalfW;
    const overlapY = Math.abs(playerY + halfH - obsY) < halfH + obsHalfH;
    const overlapZ = Math.abs(playerZ - obsZ) < halfL + obsHalfL;

    if (overlapX && overlapY && overlapZ) {
      // Check special exception for barrier_low (jumpable), barrier_high (rollable), or standing/landing on top of trains/containers/ramps
      let isCrash = true;

      if (obs.type === 'barrier_low' && playerY > 1.2) {
        // Jumped safely over low barrier
        isCrash = false;
      } else if (obs.type === 'barrier_high' && (data.isRolling || playerSize.height <= 1.0) && playerY < 0.3) {
        // Rolled safely under high barrier
        isCrash = false;
      } else if (obs.type === 'train' || obs.type === 'cargo_container' || obs.type === 'ramp') {
        if (obs.type === 'ramp' && playerZ <= obsZ - obsHalfL + 1.0) {
          // Entering ramp from front at ground level
          isCrash = false;
        } else if (data.hasJetpack) {
          // ONLY when jetpack power-up is active, landing/standing on container roof is allowed
          const topY = obs.height;
          if (playerY >= topY - 0.35) {
            isCrash = false;
          }
        }
      }

      if (isCrash) {
        collisions.push(obs.id);
      }
    }
  }

  const latencyMs = performance.now() - startTime;

  return {
    collisions,
    coinsCollected,
    magneticCoinsUpdated,
    latencyMs,
  };
}
