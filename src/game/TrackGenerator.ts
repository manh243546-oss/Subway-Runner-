/**
 * Endless Track & Obstacle Chunk Generator
 * Uses Object Pools to recycle track chunks, obstacles, powerups, and coins.
 */

import * as THREE from 'three';
import { Lane, ObstacleData, CoinData, PowerUpData, PowerUpType } from '../types';
import { ObjectPool } from '../engine/ObjectPool';

export interface TrackChunk {
  id: string;
  zStart: number;
  zEnd: number;
  active: boolean;
}

export class TrackGenerator {
  private scene: THREE.Scene;

  // Pools
  private obstaclePool: ObjectPool<ObstacleData & { active: boolean }>;
  private coinPool: ObjectPool<CoinData & { active: boolean }>;
  private powerUpPool: ObjectPool<PowerUpData & { active: boolean }>;

  // Active collections
  public activeObstacles: (ObstacleData & { active: boolean })[] = [];
  public activeCoins: (CoinData & { active: boolean })[] = [];
  public activePowerUps: (PowerUpData & { active: boolean })[] = [];

  // Three.js meshes for heavy obstacles (trains, barriers, ramps)
  private obstacleMeshGroup: THREE.Group;
  private powerUpMeshGroup: THREE.Group;

  // Track spawn state
  private nextSpawnZ: number = 20;
  private chunkLength: number = 40;
  private idCounter: number = 0;
  public currentRunSpeed: number = 22;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.obstacleMeshGroup = new THREE.Group();
    this.powerUpMeshGroup = new THREE.Group();

    this.scene.add(this.obstacleMeshGroup);
    this.scene.add(this.powerUpMeshGroup);

    // Initialize Pools with explicit reset callback handlers
    this.obstaclePool = new ObjectPool(
      () => ({
        id: `obs_${++this.idCounter}`,
        type: 'train',
        lane: 0,
        positionZ: 0,
        height: 3,
        width: 2,
        length: 12,
        dodged: false,
        active: false,
      }),
      40,
      (obs) => this.resetObstacle(obs)
    );

    this.coinPool = new ObjectPool(
      () => ({
        id: `coin_${++this.idCounter}`,
        lane: 0,
        positionY: 0.8,
        positionZ: 0,
        collected: false,
        active: false,
      }),
      800,
      (coin) => this.resetCoin(coin)
    );

    this.powerUpPool = new ObjectPool(
      () => ({
        id: `pup_${++this.idCounter}`,
        type: 'magnet',
        lane: 0,
        positionZ: 0,
        active: false,
        collected: false,
      }),
      15,
      (pup) => this.resetPowerUp(pup)
    );
  }

  /**
   * Reset obstacle state to pristine defaults
   */
  private resetObstacle(obs: ObstacleData & { active: boolean }): void {
    obs.id = '';
    obs.type = 'train';
    obs.lane = 0;
    obs.positionZ = 0;
    obs.height = 3;
    obs.width = 2;
    obs.length = 12;
    obs.dodged = false;
    obs.active = false;
  }

  /**
   * Reset coin state to pristine defaults (explicitly sets collected = false)
   */
  private resetCoin(coin: CoinData & { active: boolean }): void {
    coin.id = '';
    coin.lane = 0;
    coin.positionY = 0.8;
    coin.positionZ = 0;
    coin.collected = false;
    coin.active = false;
    coin.magneticLerp = undefined;
  }

  /**
   * Reset power-up state to pristine defaults
   */
  private resetPowerUp(pup: PowerUpData & { active: boolean }): void {
    pup.id = '';
    pup.type = 'magnet';
    pup.lane = 0;
    pup.positionZ = 0;
    pup.collected = false;
    pup.active = false;
  }

  /**
   * Reset track generator
   */
  public reset(): void {
    for (const obs of this.activeObstacles) {
      this.resetObstacle(obs);
      this.obstaclePool.release(obs);
    }
    for (const coin of this.activeCoins) {
      this.resetCoin(coin);
      this.coinPool.release(coin);
    }
    for (const pup of this.activePowerUps) {
      this.resetPowerUp(pup);
      this.powerUpPool.release(pup);
    }

    this.obstaclePool.releaseAll();
    this.coinPool.releaseAll();
    this.powerUpPool.releaseAll();

    this.activeObstacles = [];
    this.activeCoins = [];
    this.activePowerUps = [];

    while (this.obstacleMeshGroup.children.length > 0) {
      this.obstacleMeshGroup.remove(this.obstacleMeshGroup.children[0]);
    }
    while (this.powerUpMeshGroup.children.length > 0) {
      this.powerUpMeshGroup.remove(this.powerUpMeshGroup.children[0]);
    }

    this.nextSpawnZ = 20;
    this.currentRunSpeed = 22;
    // Generate initial track chunks ahead of player
    for (let i = 0; i < 5; i++) {
      this.generateChunk();
    }
  }

  /**
   * Main track update loop: spawns upcoming chunks & recycles past objects
   */
  public update(playerZ: number, runSpeed: number = 22): void {
    this.currentRunSpeed = runSpeed;
    // 1. Recycle objects far behind player (Z < playerZ - 20)
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.positionZ < playerZ - 20) {
        this.resetObstacle(obs);
        this.obstaclePool.release(obs);
        this.activeObstacles.splice(i, 1);
      }
    }

    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      if (coin.positionZ < playerZ - 10 || coin.collected) {
        this.resetCoin(coin);
        this.coinPool.release(coin);
        this.activeCoins.splice(i, 1);
      }
    }

    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const pup = this.activePowerUps[i];
      if (pup.positionZ < playerZ - 10 || pup.collected) {
        this.resetPowerUp(pup);
        this.powerUpPool.release(pup);
        this.activePowerUps.splice(i, 1);
      }
    }

    // 2. Spawn new chunks if player approaches boundary
    while (this.nextSpawnZ < playerZ + 160) {
      this.generateChunk();
    }

    // 3. Sync visual meshes for obstacles & powerups
    this.renderObstaclesAndPowerups();
  }

  /**
   * Procedural chunk pattern generator
   */
  private generateChunk(): void {
    const startZ = this.nextSpawnZ;
    const endZ = startZ + this.chunkLength;

    const patternType = Math.floor(Math.random() * 6);

    switch (patternType) {
      case 0: // Train on 1 lane, coin arches & roof train coins
        {
          const trainLane: Lane = (Math.floor(Math.random() * 3) - 1) as Lane;
          this.spawnObstacle('train', trainLane, startZ + 15, 3.2, 14);

          // Coins on train roof
          this.spawnCoinLine(trainLane, startZ + 10, 8, 3.6);

          // Coin arches on neighboring lanes
          const otherLane: Lane = trainLane === 0 ? 1 : 0;
          this.spawnCoinArch(otherLane, startZ + 5, 12);
        }
        break;

      case 1: // Low & High barriers mix + Ramp jumping
        {
          this.spawnObstacle('barrier_low', -1, startZ + 10, 1.1, 1.2);
          this.spawnObstacle('barrier_high', 0, startZ + 18, 2.5, 1.2);
          this.spawnObstacle('ramp', 1, startZ + 25, 2.8, 8);

          this.spawnCoinArch(-1, startZ + 5, 12);
          this.spawnCoinLine(0, startZ + 5, 8, 0.8);
          this.spawnCoinLine(1, startZ + 25, 7, 3.2); // Ramp top coins
        }
        break;

      case 2: // Double train pattern + PowerUp & roof coin streams
        {
          this.spawnObstacle('train', -1, startZ + 10, 3.2, 14);
          this.spawnObstacle('train', 1, startZ + 15, 3.2, 14);

          const types: PowerUpType[] = ['magnet', 'hoverboard', 'jetpack', 'multiplier', 'sneakers'];
          const chosenPup = types[Math.floor(Math.random() * types.length)];
          this.spawnPowerUp(chosenPup, 0, startZ + 20);

          this.spawnCoinLine(-1, startZ + 6, 8, 3.6);
          this.spawnCoinLine(1, startZ + 10, 8, 3.6);
          this.spawnCoinArch(0, startZ + 5, 12);
        }
        break;

      case 3: // Ramp jumping onto freight cargo container roof
        {
          this.spawnObstacle('ramp', 0, startZ + 8, 2.8, 8);
          this.spawnObstacle('cargo_container', 0, startZ + 20, 2.8, 12);

          this.spawnCoinLine(0, startZ + 8, 14, 3.2); // Roof coins
          this.spawnCoinLine(-1, startZ + 5, 10, 0.8);
        }
        break;

      case 4: // New York Freight Cargo Containers pattern
        {
          this.spawnObstacle('cargo_container', -1, startZ + 10, 2.8, 12);
          this.spawnObstacle('cargo_container', 1, startZ + 16, 2.8, 12);
          this.spawnObstacle('barrier_low', 0, startZ + 25, 1.1, 1.2);

          this.spawnCoinLine(-1, startZ + 8, 8, 3.2);
          this.spawnCoinLine(1, startZ + 14, 8, 3.2);
          this.spawnCoinArch(0, startZ + 18, 12);
        }
        break;

      default: // Triple lane gold rush matrix
        {
          this.spawnObstacle('barrier_low', 0, startZ + 15, 1.1, 1.2);
          this.spawnCoinLine(-1, startZ + 4, 14, 0.8);
          this.spawnCoinLine(0, startZ + 4, 14, 0.8);
          this.spawnCoinLine(1, startZ + 4, 14, 0.8);
        }
        break;
    }

    // Sky Jetpack / Flying High Coin Stream (y = 6.5) so jetpack users always collect coins in the air
    const skyLane: Lane = (Math.floor(Math.random() * 3) - 1) as Lane;
    this.spawnCoinLine(skyLane, startZ + 2, 12, 6.5);

    this.nextSpawnZ = endZ;
  }

  private spawnObstacle(type: ObstacleData['type'], lane: Lane, z: number, height: number, length: number): void {
    const obs = this.obstaclePool.acquire();
    this.resetObstacle(obs);
    obs.id = `obs_${++this.idCounter}`;
    obs.type = type;
    obs.lane = lane;
    obs.positionZ = z;
    obs.height = height;
    obs.length = length;
    obs.dodged = false;
    obs.active = true;

    this.activeObstacles.push(obs);
  }

  private spawnCoinLine(lane: Lane, startZ: number, count: number, y: number = 0.8): void {
    for (let i = 0; i < count; i++) {
      const coin = this.coinPool.acquire();
      this.resetCoin(coin);
      coin.id = `coin_${++this.idCounter}`;
      coin.lane = lane;
      coin.positionZ = startZ + i * 2.2;
      coin.positionY = y;
      coin.collected = false;
      coin.active = true;

      this.activeCoins.push(coin);
    }
  }

  private spawnCoinArch(lane: Lane, startZ: number, count: number = 10): void {
    // Physical parabolic jump trajectory formula:
    // Character physics: gravity = -32 m/s², jumpForce = 11 m/s (base jump)
    // Air time T = 2 * (11 / 32) = 0.6875 seconds
    const jumpAirTime = 0.6875;
    const vRun = Math.max(15, this.currentRunSpeed); // runSpeed in m/s

    for (let i = 0; i < count; i++) {
      const coin = this.coinPool.acquire();
      this.resetCoin(coin);
      coin.id = `coin_${++this.idCounter}`;
      coin.lane = lane;

      // Time offset t along the jump trajectory (0 to jumpAirTime)
      const t = (i / Math.max(1, count - 1)) * jumpAirTime;

      // Distance covered along Z at current runSpeed
      coin.positionZ = startZ + vRun * t;

      // Parabolic Y displacement: y(t) = v0*t + 0.5*g*t^2 = 11*t - 16*t^2
      const yJump = 11 * t - 16 * t * t;
      coin.positionY = 0.8 + Math.max(0, yJump);

      coin.collected = false;
      coin.active = true;

      this.activeCoins.push(coin);
    }
  }

  private spawnPowerUp(type: PowerUpType, lane: Lane, z: number): void {
    const pup = this.powerUpPool.acquire();
    this.resetPowerUp(pup);
    pup.id = `pup_${++this.idCounter}`;
    pup.type = type;
    pup.lane = lane;
    pup.positionZ = z;
    pup.collected = false;
    pup.active = true;

    this.activePowerUps.push(pup);
  }

  /**
   * Synchronize 3D meshes for non-instanced objects
   */
  private renderObstaclesAndPowerups(): void {
    // Clear old mesh containers
    while (this.obstacleMeshGroup.children.length > 0) {
      this.obstacleMeshGroup.remove(this.obstacleMeshGroup.children[0]);
    }
    while (this.powerUpMeshGroup.children.length > 0) {
      this.powerUpMeshGroup.remove(this.powerUpMeshGroup.children[0]);
    }

    const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };

    // 1. Render Obstacles
    for (const obs of this.activeObstacles) {
      if (!obs.active) continue;

      const posX = laneXMap[obs.lane] ?? 0;
      const posZ = obs.positionZ;

      if (obs.type === 'train') {
        // Red Metro Train mesh
        const trainGroup = new THREE.Group();
        const trainGeo = new THREE.BoxGeometry(2.1, 3.2, obs.length);
        const trainMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.6 });
        const trainMesh = new THREE.Mesh(trainGeo, trainMat);
        trainMesh.position.set(posX, 1.6, posZ);
        trainMesh.castShadow = true;
        trainMesh.receiveShadow = true;
        trainGroup.add(trainMesh);

        // Windows
        const winGeo = new THREE.BoxGeometry(2.15, 0.8, obs.length * 0.7);
        const winMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9 });
        const winMesh = new THREE.Mesh(winGeo, winMat);
        winMesh.position.set(posX, 2.2, posZ);
        trainGroup.add(winMesh);

        this.obstacleMeshGroup.add(trainGroup);
      } else if (obs.type === 'cargo_container') {
        // New York Freight Shipping Container
        const containerGroup = new THREE.Group();
        const containerGeo = new THREE.BoxGeometry(2.1, 2.8, obs.length);
        const containerMat = new THREE.MeshStandardMaterial({
          color: 0x0284c7, // NYC Industrial Cyan/Blue Cargo Container
          roughness: 0.4,
          metalness: 0.5,
        });
        const containerMesh = new THREE.Mesh(containerGeo, containerMat);
        containerMesh.position.set(posX, 1.4, posZ);
        containerMesh.castShadow = true;
        containerMesh.receiveShadow = true;
        containerGroup.add(containerMesh);

        // Steel Frame & Corner Castings
        const cornerGeo = new THREE.BoxGeometry(2.16, 0.15, obs.length + 0.04);
        const cornerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        const topFrame = new THREE.Mesh(cornerGeo, cornerMat);
        topFrame.position.set(posX, 2.75, posZ);
        const btmFrame = new THREE.Mesh(cornerGeo, cornerMat);
        btmFrame.position.set(posX, 0.08, posZ);
        containerGroup.add(topFrame);
        containerGroup.add(btmFrame);

        // Corrugated vertical grooves
        for (let gz = -obs.length / 2 + 0.8; gz <= obs.length / 2 - 0.8; gz += 1.2) {
          const grooveGeo = new THREE.BoxGeometry(2.14, 2.6, 0.15);
          const grooveMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5 });
          const groove = new THREE.Mesh(grooveGeo, grooveMat);
          groove.position.set(posX, 1.4, posZ + gz);
          containerGroup.add(groove);
        }

        this.obstacleMeshGroup.add(containerGroup);
      } else if (obs.type === 'barrier_low') {
        // Low jump barrier
        const barGeo = new THREE.BoxGeometry(2.2, 1.1, 0.4);
        const barMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
        const barMesh = new THREE.Mesh(barGeo, barMat);
        barMesh.position.set(posX, 0.55, posZ);
        barMesh.castShadow = true;
        this.obstacleMeshGroup.add(barMesh);
      } else if (obs.type === 'barrier_high') {
        // High roll barrier arch
        const barGeo = new THREE.BoxGeometry(2.2, 0.5, 0.4);
        const barMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
        const barMesh = new THREE.Mesh(barGeo, barMat);
        barMesh.position.set(posX, 2.3, posZ);

        // Support posts
        const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        const postL = new THREE.Mesh(postGeo, postMat);
        postL.position.set(posX - 1.0, 1.25, posZ);
        const postR = new THREE.Mesh(postGeo, postMat);
        postR.position.set(posX + 1.0, 1.25, posZ);

        this.obstacleMeshGroup.add(barMesh);
        this.obstacleMeshGroup.add(postL);
        this.obstacleMeshGroup.add(postR);
      } else if (obs.type === 'ramp') {
        // Wooden jumping ramp
        const rampGeo = new THREE.BoxGeometry(2.1, 2.8, obs.length);
        const rampMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
        const rampMesh = new THREE.Mesh(rampGeo, rampMat);
        rampMesh.position.set(posX, 1.4, posZ);
        rampMesh.rotation.x = -0.2;
        this.obstacleMeshGroup.add(rampMesh);
      }
    }

    // 2. Render PowerUps
    for (const pup of this.activePowerUps) {
      if (!pup.active || pup.collected) continue;

      const posX = laneXMap[pup.lane] ?? 0;
      const posZ = pup.positionZ;

      let color = 0xff0000;
      if (pup.type === 'magnet') color = 0xef4444; // Red Magnet
      else if (pup.type === 'hoverboard') color = 0x3b82f6; // Blue Board
      else if (pup.type === 'jetpack') color = 0x10b981; // Green Jetpack
      else if (pup.type === 'multiplier') color = 0xf59e0b; // Yellow 2x
      else if (pup.type === 'sneakers') color = 0x8b5cf6; // Purple Shoes

      const pupGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const pupMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.2,
      });

      const pupMesh = new THREE.Mesh(pupGeo, pupMat);
      pupMesh.position.set(posX, 1.2 + Math.sin(Date.now() * 0.005) * 0.2, posZ);
      pupMesh.rotation.y = Date.now() * 0.003;
      pupMesh.castShadow = true;

      this.powerUpMeshGroup.add(pupMesh);
    }
  }

  public getPoolTelemetry(): { activeObstacles: number; activeCoins: number; activePowerUps: number } {
    return {
      activeObstacles: this.activeObstacles.length,
      activeCoins: this.activeCoins.length,
      activePowerUps: this.activePowerUps.length,
    };
  }
}
