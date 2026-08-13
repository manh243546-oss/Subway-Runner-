/**
 * GPU Instancing Manager for Batch Rendering
 * Consolidates hundreds of repeated geometries (Coins, Sleepers, Pillars, Trees)
 * into InstancedMeshes to reduce draw calls to < 15.
 */

import * as THREE from 'three';

export interface InstanceTransform {
  position: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
}

export class GPUInstancer {
  private scene: THREE.Scene;
  private coinInstancedMesh!: THREE.InstancedMesh;
  private sleeperInstancedMesh!: THREE.InstancedMesh;
  private pillarInstancedMesh!: THREE.InstancedMesh;
  private dummyTransform: THREE.Object3D = new THREE.Object3D();

  private maxCoins: number = 800;
  private maxSleepers: number = 600;
  private maxPillars: number = 120;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initCoinInstancing();
    this.initSleeperInstancing();
    this.initPillarInstancing();
  }

  /**
   * Initialize Instanced Mesh for Coins
   */
  private initCoinInstancing(): void {
    // Coin Geometry: Thin cylinder / torus-like disc
    const geometry = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16);
    geometry.rotateX(Math.PI / 2); // Facing player

    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xffa500,
      emissiveIntensity: 0.3,
    });

    this.coinInstancedMesh = new THREE.InstancedMesh(geometry, material, this.maxCoins);
    this.coinInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.coinInstancedMesh.castShadow = true;
    this.coinInstancedMesh.receiveShadow = true;
    this.coinInstancedMesh.frustumCulled = false;

    // Initialize invisible
    for (let i = 0; i < this.maxCoins; i++) {
      this.dummyTransform.position.set(0, -999, 0);
      this.dummyTransform.scale.set(0, 0, 0);
      this.dummyTransform.updateMatrix();
      this.coinInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.coinInstancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.coinInstancedMesh);
  }

  /**
   * Initialize Instanced Mesh for Railway Sleepers (wooden ties)
   */
  private initSleeperInstancing(): void {
    const geometry = new THREE.BoxGeometry(2.2, 0.1, 0.35);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a2e18,
      roughness: 0.9,
    });

    this.sleeperInstancedMesh = new THREE.InstancedMesh(geometry, material, this.maxSleepers);
    this.sleeperInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.sleeperInstancedMesh.receiveShadow = true;
    this.sleeperInstancedMesh.frustumCulled = false;

    for (let i = 0; i < this.maxSleepers; i++) {
      this.dummyTransform.position.set(0, -999, 0);
      this.dummyTransform.scale.set(0, 0, 0);
      this.dummyTransform.updateMatrix();
      this.sleeperInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.sleeperInstancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.sleeperInstancedMesh);
  }

  /**
   * Initialize Instanced Mesh for Track Side Light Pillars
   */
  private initPillarInstancing(): void {
    const geometry = new THREE.CylinderGeometry(0.08, 0.1, 3.5, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    });

    this.pillarInstancedMesh = new THREE.InstancedMesh(geometry, material, this.maxPillars);
    this.pillarInstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.pillarInstancedMesh.frustumCulled = false;

    for (let i = 0; i < this.maxPillars; i++) {
      this.dummyTransform.position.set(0, -999, 0);
      this.dummyTransform.scale.set(0, 0, 0);
      this.dummyTransform.updateMatrix();
      this.pillarInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.pillarInstancedMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.pillarInstancedMesh);
  }

  /**
   * Fast update railway sleepers instances without array allocation
   */
  updateSleepersFast(playerZ: number): void {
    const minZ = Math.floor(playerZ - 10);
    const maxZ = Math.floor(playerZ + 140);
    let idx = 0;

    for (let z = minZ; z <= maxZ && idx + 2 < this.maxSleepers; z += 1.8) {
      // x = -2.5
      this.dummyTransform.position.set(-2.5, 0.05, z);
      this.dummyTransform.rotation.set(0, 0, 0);
      this.dummyTransform.scale.set(1, 1, 1);
      this.dummyTransform.updateMatrix();
      this.sleeperInstancedMesh.setMatrixAt(idx++, this.dummyTransform.matrix);

      // x = 0
      this.dummyTransform.position.set(0, 0.05, z);
      this.dummyTransform.updateMatrix();
      this.sleeperInstancedMesh.setMatrixAt(idx++, this.dummyTransform.matrix);

      // x = 2.5
      this.dummyTransform.position.set(2.5, 0.05, z);
      this.dummyTransform.updateMatrix();
      this.sleeperInstancedMesh.setMatrixAt(idx++, this.dummyTransform.matrix);
    }

    // Hide remaining unused sleeper instances
    for (let i = idx; i < this.maxSleepers; i++) {
      this.dummyTransform.position.set(0, -999, 0);
      this.dummyTransform.scale.set(0, 0, 0);
      this.dummyTransform.updateMatrix();
      this.sleeperInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.sleeperInstancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Fast update side pillars instances without array allocation
   */
  updatePillarsFast(playerZ: number): void {
    const minZ = Math.floor(playerZ - 10);
    const maxZ = Math.floor(playerZ + 140);
    let idx = 0;

    for (let z = minZ; z <= maxZ && idx + 1 < this.maxPillars; z += 18) {
      // x = -4.8
      this.dummyTransform.position.set(-4.8, 1.75, z);
      this.dummyTransform.rotation.set(0, 0, 0);
      this.dummyTransform.scale.set(1, 1, 1);
      this.dummyTransform.updateMatrix();
      this.pillarInstancedMesh.setMatrixAt(idx++, this.dummyTransform.matrix);

      // x = 4.8
      this.dummyTransform.position.set(4.8, 1.75, z);
      this.dummyTransform.updateMatrix();
      this.pillarInstancedMesh.setMatrixAt(idx++, this.dummyTransform.matrix);
    }

    // Hide remaining unused pillar instances
    for (let i = idx; i < this.maxPillars; i++) {
      this.dummyTransform.position.set(0, -999, 0);
      this.dummyTransform.scale.set(0, 0, 0);
      this.dummyTransform.updateMatrix();
      this.pillarInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.pillarInstancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Update all coin instances transforms
   */
  updateCoins(coins: { x: number; y: number; z: number; rotationY: number; active: boolean }[]): void {
    const count = Math.min(coins.length, this.maxCoins);

    for (let i = 0; i < this.maxCoins; i++) {
      if (i < count && coins[i].active) {
        const c = coins[i];
        this.dummyTransform.position.set(c.x, c.y, c.z);
        this.dummyTransform.rotation.set(0, c.rotationY, 0);
        this.dummyTransform.scale.set(1, 1, 1);
      } else {
        this.dummyTransform.position.set(0, -999, 0);
        this.dummyTransform.scale.set(0, 0, 0);
      }
      this.dummyTransform.updateMatrix();
      this.coinInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.coinInstancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Update railway sleepers instances
   */
  updateSleepers(sleepers: { x: number; z: number; active: boolean }[]): void {
    const count = Math.min(sleepers.length, this.maxSleepers);

    for (let i = 0; i < this.maxSleepers; i++) {
      if (i < count && sleepers[i].active) {
        const s = sleepers[i];
        this.dummyTransform.position.set(s.x, 0.05, s.z);
        this.dummyTransform.rotation.set(0, 0, 0);
        this.dummyTransform.scale.set(1, 1, 1);
      } else {
        this.dummyTransform.position.set(0, -999, 0);
        this.dummyTransform.scale.set(0, 0, 0);
      }
      this.dummyTransform.updateMatrix();
      this.sleeperInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.sleeperInstancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Update side pillars instances
   */
  updatePillars(pillars: { x: number; z: number; active: boolean }[]): void {
    const count = Math.min(pillars.length, this.maxPillars);

    for (let i = 0; i < this.maxPillars; i++) {
      if (i < count && pillars[i].active) {
        const p = pillars[i];
        this.dummyTransform.position.set(p.x, 1.75, p.z);
        this.dummyTransform.rotation.set(0, 0, 0);
        this.dummyTransform.scale.set(1, 1, 1);
      } else {
        this.dummyTransform.position.set(0, -999, 0);
        this.dummyTransform.scale.set(0, 0, 0);
      }
      this.dummyTransform.updateMatrix();
      this.pillarInstancedMesh.setMatrixAt(i, this.dummyTransform.matrix);
    }

    this.pillarInstancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Clean up WebGL resources
   */
  dispose(): void {
    this.coinInstancedMesh.geometry.dispose();
    (this.coinInstancedMesh.material as THREE.Material).dispose();
    this.sleeperInstancedMesh.geometry.dispose();
    (this.sleeperInstancedMesh.material as THREE.Material).dispose();
    this.pillarInstancedMesh.geometry.dispose();
    (this.pillarInstancedMesh.material as THREE.Material).dispose();

    this.scene.remove(this.coinInstancedMesh);
    this.scene.remove(this.sleeperInstancedMesh);
    this.scene.remove(this.pillarInstancedMesh);
  }
}
