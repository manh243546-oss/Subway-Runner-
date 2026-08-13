/**
 * Subway Surfers 3D Main Engine
 * High Performance WebGL Endless Runner Engine
 */

import * as THREE from 'three';

class SubwayTimer {
  private previousTime: number = performance.now();
  private currentTime: number = performance.now();
  private delta: number = 0;

  public update(): void {
    this.previousTime = this.currentTime;
    this.currentTime = performance.now();
    this.delta = (this.currentTime - this.previousTime) / 1000;
  }

  public getDelta(): number {
    return this.delta;
  }
}

import { Lane, PlayerStats, PerformanceMetrics, PowerUpType, PowerUpActiveState, ComboState } from '../types';
import { GPUInstancer } from '../engine/GPUInstancer';
import { SpatialHashGrid3D } from '../engine/SpatialHashGrid';
import { WorkerBridge } from '../engine/WorkerBridge';
import { TouchManager } from '../engine/TouchManager';
import { SoundEngine } from '../engine/SoundEngine';
import { Character3D } from './Character3D';
import { TrackGenerator } from './TrackGenerator';
import { ItemManager } from './ItemManager';
import { DailyChallengeManager, DailyObjectiveDef } from './DailyChallengeManager';

export class SubwayEngine {
  private container: HTMLElement;

  // Three.js Core
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  // Engine Components
  private gpuInstancer: GPUInstancer;
  private spatialGrid: SpatialHashGrid3D<any>;
  private workerBridge: WorkerBridge;
  private touchManager: TouchManager;
  private soundEngine: SoundEngine;
  private character3D: Character3D;
  private trackGenerator: TrackGenerator;

  // Infinite Environment Meshes & Dynamic Chunks
  private groundMesh!: THREE.Mesh;
  private railMeshes: THREE.Mesh[] = [];
  private containerSliceGroups: { initialZOffset: number; group: THREE.Group }[] = [];
  private gantryCranes: { initialZOffset: number; group: THREE.Group }[] = [];
  private skylineGroup!: THREE.Group;

  // Game Loop State
  private isRunning: boolean = false;
  private isGameOver: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private timer: SubwayTimer = new SubwayTimer();

  // Player State
  private currentLane: Lane = 0;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerZ: number = 0;
  private targetX: number = 0;

  private velocityY: number = 0;
  private gravity: number = -32;
  private jumpForce: number = 11;
  private isJumping: boolean = false;
  private isRolling: boolean = false;
  private rollTimer: number = 0;

  // Speed & Progress
  private runSpeed: number = 22; // Initial m/s
  private baseSpeed: number = 22;
  private maxSpeed: number = 42;
  private speedMultiplier: number = 1.0;

  // Active Power-ups State
  private activePowerUps: Map<PowerUpType, PowerUpActiveState> = new Map();
  private invincibilityTimer: number = 0;
  private jetpackTransitionTimer: number = 0;
  private jetpackStartY: number = 0;

  // Dodge Combo State
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private comboMaxTimer: number = 2.5; // 2.5s window to maintain dodge combo
  private bonusMultiplier: number = 0;
  private lastDodgeText: string = '';
  private lastDodgeTimestamp: number = 0;

  // Stats & Callbacks
  public stats: PlayerStats;
  private runTimeSeconds: number = 0;
  private coinsCollectedThisRun: number = 0;
  private onGameOverCallback?: (finalScore: number, coins: number, runTimeSeconds: number, distance: number) => void;
  private onStatsUpdateCallback?: (stats: PlayerStats, activePowerups: PowerUpActiveState[], comboState?: ComboState, runTimeSeconds?: number) => void;
  private onPerformanceUpdateCallback?: (metrics: PerformanceMetrics) => void;
  private onDailyChallengeCompletedCallback?: (challengeDef: DailyObjectiveDef) => void;

  // Performance telemetry
  private frameCount: number = 0;
  private lastFpsCheckTime: number = performance.now();
  private currentFps: number = 60;
  private frameTimeMs: number = 16.6;

    // Performance optimization caches
    private isProcessingCollisions: boolean = false;
    private cachedTaskData: any = null;
    private lastCoinCount: number = -1;
    private lastObstacleCount: number = -1;
    private lastShadowUpdateTime: number = 0;
    private shadowUpdateInterval: number = 0.1; // 100ms
    private lastFormattedCoins: any[] = [];
    private lastFormattedCoinsTime: number = 0;
    private coinFormatCacheMs: number = 50; // Update cache every 50ms
    private lastFrameTime: number = 0;
    private readonly TARGET_FRAME_MS: number = 1000 / 30; // Cap 30fps

  constructor(
    container: HTMLElement,
    initialStats: PlayerStats,
    callbacks: {
      onGameOver?: (finalScore: number, coins: number, runTimeSeconds: number, distance: number) => void;
      onStatsUpdate?: (stats: PlayerStats, activePowerups: PowerUpActiveState[], comboState?: ComboState, runTimeSeconds?: number) => void;
      onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
      onDailyChallengeCompleted?: (challengeDef: DailyObjectiveDef) => void;
    }
  ) {
    this.container = container;
    const { updatedStats } = DailyChallengeManager.ensureDailyChallenge(initialStats);
    this.stats = updatedStats;
    this.onGameOverCallback = callbacks.onGameOver;
    this.onStatsUpdateCallback = callbacks.onStatsUpdate;
    this.onPerformanceUpdateCallback = callbacks.onPerformanceUpdate;
    this.onDailyChallengeCompletedCallback = callbacks.onDailyChallengeCompleted;

    // 1. Initialize Three.js Scene, Camera, WebGLRenderer (Vibrant New York Daytime Atmosphere)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8); // Bright sunny New York sky blue
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.018); // Thick sunlight haze (3.6x thicker to cull distant objects)

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Camera setup initialized to front-facing showcase view (Far plane reduced 200 -> 100)
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    this.setCameraShowcaseView();

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Max pixel ratio 1
    this.renderer.shadowMap.enabled = false; // Disable all real-time shadow maps
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    // Handle WebGL context loss (prevents blackout crash)
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.isRunning = false;
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      console.warn('WebGL context lost - game paused');
    }, false);

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.warn('WebGL context restored');
    }, false);

    container.appendChild(this.renderer.domElement);

    // 2. Lighting Setup (Radiant Sunlight)
    this.ambientLight = new THREE.AmbientLight(0xe0f2fe, 0.75);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    this.dirLight.position.set(15, 30, 20);
    this.dirLight.castShadow = false; // Disable directional light shadow
    this.scene.add(this.dirLight);

    // 3. Engine Systems
    this.gpuInstancer = new GPUInstancer(this.scene);
    this.spatialGrid = new SpatialHashGrid3D(10);
    this.workerBridge = new WorkerBridge();
    this.soundEngine = new SoundEngine();

    this.character3D = new Character3D();
    const activeSkin = ItemManager.getSelectedSkinForCharacter(this.stats, this.stats.selectedCharacter || 'Jake Hero');
    this.character3D.buildCharacter(this.stats.selectedCharacter, activeSkin);
    this.character3D.buildHoverboard(this.stats.selectedBoard);
    this.character3D.buildJetpack();
    this.scene.add(this.character3D.group);

    this.trackGenerator = new TrackGenerator(this.scene);

    // 4. Input Manager
    this.touchManager = new TouchManager(this.container, (action) => this.handleAction(action));

    // Handle Window Resize
    window.addEventListener('resize', this.onResize);

    // Build Ground Tracks & New York Freight Container Yard Environment
    this.buildGroundTracks();
    this.buildNewYorkFreightContainerYard();
  }

  /**
   * Build baseline ground tracks with yellow hazard safety stripes
   */
  private buildGroundTracks(): void {
    // Freight Yard Ground Bed - generous 800m length plane for continuous infinite coverage
    const groundGeo = new THREE.PlaneGeometry(18, 800);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.set(0, 0, 300);
    this.scene.add(this.groundMesh);

    // Metallic Steel Railing Lines (6 rails across 3 lanes, 800m long)
    const railGeo = new THREE.BoxGeometry(0.08, 0.1, 800);
    const railMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

    const railPositions = [-3.2, -1.8, -0.7, 0.7, 1.8, 3.2];
    this.railMeshes = [];
    railPositions.forEach((rx) => {
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(rx, 0.1, 300);
      this.scene.add(rail);
      this.railMeshes.push(rail);
    });
  }

  /**
   * Build New York Cargo Freight Container Yard Environment (Thùng công-ten-nơ hàng hóa New York)
   * Uses dynamic slice chunks for seamless infinite scrolling.
   */
  private buildNewYorkFreightContainerYard(): void {
    const containerColors = [0xef4444, 0x0284c7, 0xf59e0b, 0x10b981, 0xf97316, 0x1e293b];
    // PERFORMANCE: Use MeshLambertMaterial instead of MeshStandardMaterial (no PBR, ~40% faster)
    const sharedContainerMats = containerColors.map((color) =>
      new THREE.MeshLambertMaterial({ color })
    );
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });

    this.containerSliceGroups = [];
    this.gantryCranes = [];

    // Shared geometries & materials
    const containerGeo = new THREE.BoxGeometry(3.6, 2.8, 11);
    const frameGeo = new THREE.BoxGeometry(3.7, 0.15, 11.05);

    // 1. Stacked Containers along Left (-7.5) & Right (+7.5) Perimeters
    // 20 slices spaced every 12 meters = 240m continuous span
    for (let sliceIdx = -2; sliceIdx < 18; sliceIdx++) {
      const zOffset = sliceIdx * 12;
      const sliceGroup = new THREE.Group();

      [-7.5, 7.5].forEach((xPos, sideIdx) => {
        const stackHeight = 1 + Math.floor(Math.sin((sliceIdx + 10) * 0.4 + sideIdx) * 1.2 + 1.2); // 1-3 tiers high

        for (let tier = 0; tier < stackHeight; tier++) {
          const colorIdx = (Math.abs(sliceIdx) + tier + sideIdx * 3) % containerColors.length;
          const containerMat = sharedContainerMats[colorIdx];

          const boxMesh = new THREE.Mesh(containerGeo, containerMat);
          const posY = 1.4 + tier * 2.85;
          boxMesh.position.set(xPos, posY, 0);
          boxMesh.castShadow = false;
          boxMesh.receiveShadow = false;
          sliceGroup.add(boxMesh);

          // Steel frame borders
          const frameTop = new THREE.Mesh(frameGeo, frameMat);
          frameTop.position.set(xPos, posY + 1.35, 0);
          sliceGroup.add(frameTop);
        }
      });

      sliceGroup.position.set(0, 0, zOffset);
      this.scene.add(sliceGroup);
      this.containerSliceGroups.push({ initialZOffset: zOffset, group: sliceGroup });
    }

    // 2. Spanning Gantry Crane Overhead Steel Frames every 60 meters (4 cranes total)
    const gantryMat = new THREE.MeshLambertMaterial({ color: 0xeab308 });
    for (let craneIdx = 0; craneIdx < 4; craneIdx++) {
      const zOffset = craneIdx * 60 + 30;
      const craneGroup = new THREE.Group();

      const gantryBeam = new THREE.Mesh(new THREE.BoxGeometry(18, 0.6, 0.8), gantryMat);
      gantryBeam.position.set(0, 9.5, 0);

      const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), gantryMat);
      pillarL.position.set(-8.8, 4.8, 0);
      const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), gantryMat);
      pillarR.position.set(8.8, 4.8, 0);

      craneGroup.add(gantryBeam);
      craneGroup.add(pillarL);
      craneGroup.add(pillarR);

      craneGroup.position.set(0, 0, zOffset);
      this.scene.add(craneGroup);
      this.gantryCranes.push({ initialZOffset: zOffset, group: craneGroup });
    }

    // 3. Distant New York Skyline Skyscraper Backdrop
    this.skylineGroup = new THREE.Group();
    const skylineGeo = new THREE.BoxGeometry(8, 45, 8);
    const skylineMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const bldg = new THREE.Mesh(skylineGeo, skylineMat);
      bldg.position.set(i * 18, 20, 0);
      this.skylineGroup.add(bldg);
    }
    this.skylineGroup.position.set(0, 0, 450);
    this.scene.add(this.skylineGroup);
  }

  /**
   * Handle Player Gestures & Key Inputs
   */
  public handleAction(action: 'left' | 'right' | 'jump' | 'roll' | 'hoverboard'): void {
    if (!this.isRunning || this.isGameOver || this.isPaused) return;

    if (action === 'left') {
      if (this.currentLane > -1) {
        this.currentLane = (this.currentLane - 1) as Lane;
        this.soundEngine.playRoll();
      }
    } else if (action === 'right') {
      if (this.currentLane < 1) {
        this.currentLane = (this.currentLane + 1) as Lane;
        this.soundEngine.playRoll();
      }
    } else if (action === 'jump') {
      const hasSneakers = this.activePowerUps.has('sneakers');
      const force = hasSneakers ? this.jumpForce * 1.35 : this.jumpForce;

      if (!this.isJumping) {
        this.isJumping = true;
        this.velocityY = force;
        this.soundEngine.playJump();
      }
    } else if (action === 'roll') {
      // Ignore ground roll action while flying with jetpack
      if (this.activePowerUps.has('jetpack')) {
        return;
      }
      if (!this.isRolling) {
        this.isRolling = true;
        this.rollTimer = 0.6; // 0.6s roll duration
        this.soundEngine.playRoll();
        if (this.isJumping) {
          // Fast drop if in air
          this.velocityY = -22;
        }
      }
    } else if (action === 'hoverboard') {
      this.activateConsumable('hoverboard');
    }
  }

  /**
   * Activate Single-Use Consumable Items from Inventory
   */
  public activateConsumable(itemType: 'hoverboard' | 'headstart' | 'magnet' | 'multiplier'): boolean {
    if (!this.isRunning || this.isGameOver || this.isPaused) return false;

    // Ensure consumables object exists
    if (!this.stats.consumables) {
      this.stats.consumables = {
        hoverboardCount: 5,
        headstartCount: 2,
        magnetBoostCount: 2,
        scoreBoosterCount: 2,
      };
    }

    if (itemType === 'hoverboard') {
      const hoverQty = this.stats.consumables.hoverboardCount || 0;
      if (hoverQty <= 0) return false;

      this.stats.consumables.hoverboardCount = hoverQty - 1;
      const boardLevel = this.stats.permanentUpgrades?.hoverboardLevel || this.stats.powerUpUpgrades?.hoverboardLevel || 1;
      const duration = 10 + (boardLevel - 1) * 2;

      this.activePowerUps.set('hoverboard', {
        type: 'hoverboard',
        duration,
        maxDuration: duration,
      });

      this.character3D.setHoverboardActive(true);
      this.soundEngine.playHoverboard();

      const { updatedStats, newlyCompletedTasks } = DailyChallengeManager.updateProgress(this.stats, 'use_hoverboard', 1);
      this.stats = updatedStats;
      if (newlyCompletedTasks.length > 0 && this.onDailyChallengeCompletedCallback) {
        newlyCompletedTasks.forEach((task) => {
          this.onDailyChallengeCompletedCallback!({
            id: task.id,
            type: task.type,
            title: task.title,
            description: task.description,
            targetValue: task.targetValue,
            rewardCoins: task.rewardCoins,
            rewardHoverboards: task.rewardHoverboards || 0,
            icon: task.icon,
            color: task.color,
          });
        });
      }

      return true;
    }

    if (itemType === 'headstart') {
      const hsQty = this.stats.consumables.headstartCount || 0;
      if (hsQty <= 0) return false;

      this.stats.consumables.headstartCount = hsQty - 1;
      const jetLevel = this.stats.permanentUpgrades?.jetpackLevel || this.stats.powerUpUpgrades?.jetpackLevel || 1;
      const duration = 10 + (jetLevel - 1) * 2;

      this.activePowerUps.set('jetpack', {
        type: 'jetpack',
        duration,
        maxDuration: duration,
      });

      this.jetpackTransitionTimer = 0;
      this.jetpackStartY = this.playerY;
      this.character3D.setJetpackActive(true);
      this.soundEngine.playPowerUp();
      return true;
    }

    if (itemType === 'magnet') {
      const magQty = this.stats.consumables.magnetBoostCount || 0;
      if (magQty <= 0) return false;

      this.stats.consumables.magnetBoostCount = magQty - 1;
      const magnetLevel = this.stats.permanentUpgrades?.magnetLevel || this.stats.powerUpUpgrades?.magnetLevel || 1;
      const duration = 10 + (magnetLevel - 1) * 2;

      this.activePowerUps.set('magnet', {
        type: 'magnet',
        duration,
        maxDuration: duration,
      });

      this.soundEngine.playPowerUp();
      return true;
    }

    if (itemType === 'multiplier') {
      const multQty = this.stats.consumables.scoreBoosterCount || 0;
      if (multQty <= 0) return false;

      this.stats.consumables.scoreBoosterCount = multQty - 1;
      const multLevel = this.stats.permanentUpgrades?.multiplierLevel || this.stats.powerUpUpgrades?.multiplierLevel || 1;
      const duration = 10 + (multLevel - 1) * 2;

      this.activePowerUps.set('multiplier', {
        type: 'multiplier',
        duration,
        maxDuration: duration,
      });

      this.soundEngine.playPowerUp();
      return true;
    }

    return false;
  }

  /**
   * Set front-facing showcase view camera (idle/ready state before play)
   */
  public setCameraShowcaseView(): void {
    this.camera.position.set(this.playerX, 1.8, this.playerZ + 3.2);
    this.camera.lookAt(this.playerX, this.playerY + 1.1, this.playerZ);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Set third-person chase view camera (active gameplay state)
   */
  public setCameraChaseView(): void {
    const targetCamX = this.playerX * 0.4;
    const targetCamY = 4.5 + (this.playerY / 6.5) * 5.0 + (this.isJumping ? 0.3 : 0);
    const targetCamZ = this.playerZ - 6.5;

    this.camera.position.set(targetCamX, targetCamY, targetCamZ);
    this.camera.lookAt(this.playerX * 0.2, this.playerY + 1.2, this.playerZ + 8);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Reset engine back to front-facing showcase view idle state
   */
  public resetToIdle(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.currentLane = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.targetX = 0;
    this.runTimeSeconds = 0;

    this.character3D.group.position.set(0, 0, 0);
    this.character3D.group.rotation.set(0, 0, 0);
    this.character3D.setHoverboardActive(false);
    this.character3D.setJetpackActive(false);

    this.trackGenerator.reset();
    this.setCameraShowcaseView();
    this.updateInstancedMeshes();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start New Game Session
   */
  public start(): void {
    this.isRunning = true;
    this.isGameOver = false;
    this.isPaused = false;

    this.currentLane = 0;
    this.playerX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.targetX = 0;

    // Instantly set camera to third-person follow view upon starting game
    this.setCameraChaseView();

    // 1. Calculate Starting Attributes from Permanent Upgrades
    const speedLevel = this.stats.permanentUpgrades?.baseSpeedLevel || 1;
    this.baseSpeed = 22 + (speedLevel - 1) * 2;
    this.runSpeed = this.baseSpeed;

    const baseMultiLevel = this.stats.permanentUpgrades?.baseMultiplierLevel || 1;
    this.stats.multiplier = 1 + (baseMultiLevel - 1);

    this.stats.currentScore = 0;
    this.coinsCollectedThisRun = 0;
    this.runTimeSeconds = 0;
    this.activePowerUps.clear();

    this.comboCount = 0;
    this.comboTimer = 0;
    this.bonusMultiplier = 0;
    this.lastDodgeText = '';

    this.character3D.setHoverboardActive(false);
    this.character3D.setJetpackActive(false);

    this.trackGenerator.reset();

    // Reset infinite environment chunk offsets
    for (const slice of this.containerSliceGroups) {
      slice.group.position.z = slice.initialZOffset;
    }
    for (const crane of this.gantryCranes) {
      crane.group.position.z = crane.initialZOffset;
    }
    if (this.skylineGroup) {
      this.skylineGroup.position.z = 450;
    }
    if (this.groundMesh) {
      this.groundMesh.position.z = 300;
    }
    this.railMeshes.forEach((r) => (r.position.z = 300));

    this.timer.update();
    this.soundEngine.startBGM();

    this.loop();
  }

  /**
   * Pause Game
   */
  public pause(): void {
    this.isPaused = true;
  }

  /**
   * Resume Game
   */
  public resume(): void {
    this.isPaused = false;
    this.timer.update();
  }

  /**
   * Force trigger game over immediately (e.g. from Pause / Settings modal "Kết thúc")
   */
  public triggerGameOver(): void {
    this.handleCrashGameOver();
  }

  /**
   * Stop engine completely (e.g. from Pause / Settings modal "Thoát về sảnh")
   */
  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.soundEngine.stopBGM();
  }

  /**
   * Main 30 FPS Engine Render & Physics Loop
   */
  private loop = (): void => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.loop);

    // Skip rendering when browser tab is hidden
    if (document.hidden) return;

    if (this.isPaused) return;

    // FPS limiter: cap at 30fps
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    if (elapsed < this.TARGET_FRAME_MS) return;
    this.lastFrameTime = now - (elapsed % this.TARGET_FRAME_MS);

    this.timer.update();
    const delta = Math.min(this.timer.getDelta(), 0.05);
    this.runTimeSeconds += delta;

    // 1. Telemetry Calculation
    this.frameCount++;
    if (now - this.lastFpsCheckTime >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCheckTime));
      this.frameTimeMs = parseFloat((delta * 1000).toFixed(1));
      this.frameCount = 0;
      this.lastFpsCheckTime = now;

      this.emitPerformanceMetrics();
    }

    // 2. Speed Acceleration & Distance Progression
    this.runSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.playerZ * 0.005);
    const prevDist = this.stats.distance || 0;
    this.playerZ += this.runSpeed * delta;
    const currentDist = Math.floor(this.playerZ);
    this.stats.distance = currentDist;

    if (currentDist > prevDist) {
      const { updatedStats: distStats, newlyCompletedTasks: distTasks } = DailyChallengeManager.updateProgress(this.stats, 'run_distance', currentDist - prevDist);
      this.stats = distStats;
      if (distTasks.length > 0 && this.onDailyChallengeCompletedCallback) {
        distTasks.forEach((task) => {
          this.onDailyChallengeCompletedCallback!({
            id: task.id,
            type: task.type,
            title: task.title,
            description: task.description,
            targetValue: task.targetValue,
            rewardCoins: task.rewardCoins,
            rewardHoverboards: task.rewardHoverboards || 0,
            icon: task.icon,
            color: task.color,
          });
        });
      }
    }

    // Decay Dodge Combo Timer
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.comboTimer = 0;
        this.comboCount = 0;
        this.bonusMultiplier = 0;
      }
    }

    // Check Obstacle Dodges (Obstacle passed safely without collision)
    for (let i = 0; i < this.trackGenerator.activeObstacles.length; i++) {
      const obs = this.trackGenerator.activeObstacles[i];
      if (obs.active && !obs.dodged && obs.positionZ < this.playerZ - 1.2) {
        obs.dodged = true;
        this.triggerDodgeCombo();
      }
    }

    // Calculate total effective score multiplier (Base + Combo Bonus)
    const baseMult = this.stats.multiplier || 1;
    let currentMultiplier = baseMult + this.bonusMultiplier;
    if (this.activePowerUps.has('multiplier')) {
      currentMultiplier *= 2;
    }
    const scoreInc = Math.floor(this.runSpeed * delta * currentMultiplier);
    this.stats.currentScore += scoreInc;

    if (scoreInc > 0) {
      const { updatedStats: scoreStats, newlyCompletedTasks: scoreTasks } = DailyChallengeManager.updateProgress(this.stats, 'score_points', this.stats.currentScore);
      this.stats = scoreStats;
      if (scoreTasks.length > 0 && this.onDailyChallengeCompletedCallback) {
        scoreTasks.forEach((task) => {
          this.onDailyChallengeCompletedCallback!({
            id: task.id,
            type: task.type,
            title: task.title,
            description: task.description,
            targetValue: task.targetValue,
            rewardCoins: task.rewardCoins,
            rewardHoverboards: task.rewardHoverboards || 0,
            icon: task.icon,
            color: task.color,
          });
        });
      }
    }

    // 3. Lane Smooth Lerp (Left +2.5, Center 0, Right -2.5)
    const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };
    this.targetX = laneXMap[this.currentLane] ?? 0;
    this.playerX += (this.targetX - this.playerX) * 18 * delta;

    // 4. Vertical Jump & Roll Physics
    const jetpackState = this.activePowerUps.get('jetpack');
    const currentGroundY = this.getGroundY(this.playerX, this.playerZ);

    if (jetpackState) {
      this.isJumping = false;
      this.isRolling = false;
      this.velocityY = 0;

      const transitionTime = 0.7; // 0.7s smooth take-off & landing transition
      const targetFlightY = 6.5;

      if (this.jetpackTransitionTimer < transitionTime) {
        // Phase 1: Smooth Take-off (Ascent)
        this.jetpackTransitionTimer += delta;
        const progress = Math.min(1, this.jetpackTransitionTimer / transitionTime);
        // Ease-out cubic: smooth acceleration off ground and gentle deceleration at peak altitude
        const ease = 1 - Math.pow(1 - progress, 3);
        this.playerY = this.jetpackStartY + (targetFlightY - this.jetpackStartY) * ease;
      } else if (jetpackState.duration > transitionTime) {
        // Phase 2: Cruising Altitude (Flight Float)
        this.playerY = targetFlightY + Math.sin(this.runTimeSeconds * 3) * 0.08;
      } else {
        // Phase 3: Controlled Descent (Landing)
        const remainingRatio = Math.max(0, jetpackState.duration / transitionTime); // 1.0 -> 0.0
        const progress = 1 - remainingRatio; // 0.0 -> 1.0
        // Ease-in-out quad: soft departure from high altitude & gentle touchdown on track
        const ease = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        this.playerY = currentGroundY + (targetFlightY - currentGroundY) * (1 - ease);
      }
    } else {
      this.jetpackTransitionTimer = 0;
      if (this.isJumping) {
        this.velocityY += this.gravity * delta;
        this.playerY += this.velocityY * delta;

        if (this.playerY <= currentGroundY) {
          this.playerY = currentGroundY;
          this.isJumping = false;
          this.velocityY = 0;
        }
      } else {
        if (this.playerY > currentGroundY + 0.1) {
          // Player stepped off container edge or landed onto platform; fall with gravity towards currentGroundY
          this.isJumping = true;
          this.velocityY = 0;
        } else {
          this.playerY = currentGroundY;
        }
      }
    }

    if (this.isRolling) {
      this.rollTimer -= delta;
      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
      if (this.invincibilityTimer < 0) this.invincibilityTimer = 0;
    }

    // 5. Update Power-up Timers
    const activePowerupList: PowerUpActiveState[] = [];
    for (const [type, state] of this.activePowerUps.entries()) {
      state.duration -= delta;
      if (state.duration <= 0) {
        this.activePowerUps.delete(type);
        if (type === 'hoverboard') this.character3D.setHoverboardActive(false);
        if (type === 'jetpack') {
          this.character3D.setJetpackActive(false);
          this.playerY = this.getGroundY(this.playerX, this.playerZ);
        }
      } else {
        activePowerupList.push(state);
      }
    }

    // 6. Character Mesh & Camera Position Sync
    this.character3D.group.position.set(this.playerX, this.playerY, this.playerZ);

    // Lean and turn naturally into lane shifts towards target direction
    const deltaX = this.targetX - this.playerX;
    this.character3D.group.rotation.z = deltaX * 0.06;
    this.character3D.group.rotation.y = -deltaX * 0.08;

    const isJetpack = this.activePowerUps.has('jetpack');
    this.character3D.animate(delta, this.runSpeed, this.isJumping, this.isRolling, this.activePowerUps.has('hoverboard'), isJetpack);
    this.character3D.updateParticles(delta, this.isRunning && !this.isPaused);

    // Camera Spring Follow in Third-Person View (smoothly scaled with player flight altitude)
    const targetCamX = this.playerX * 0.4;
    const targetCamY = 4.5 + (this.playerY / 6.5) * 5.0 + (this.isJumping ? 0.3 : 0);
    const targetCamZ = this.playerZ - 6.5;

    this.camera.position.x += (targetCamX - this.camera.position.x) * 10 * delta;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 8 * delta;
    this.camera.position.z = targetCamZ;
    this.camera.lookAt(this.playerX * 0.2, this.playerY + 1.2, this.playerZ + 8);

    // Throttled Directional Light Shadow Follow
    const nowSec = this.runTimeSeconds;
    if (nowSec - this.lastShadowUpdateTime >= this.shadowUpdateInterval) {
      this.dirLight.position.set(this.playerX + 10, 25, this.playerZ + 15);
      this.dirLight.target.position.set(this.playerX, 0, this.playerZ + 10);
      this.dirLight.target.updateMatrixWorld();
      this.lastShadowUpdateTime = nowSec;
    }

    // 7. Track Generator Update
    this.trackGenerator.update(this.playerZ, this.runSpeed);

    // 8. Infinite Ground & Environment Recycling
    const centerGroundZ = this.playerZ + 300;
    if (this.groundMesh) {
      this.groundMesh.position.z = centerGroundZ;
    }
    this.railMeshes.forEach((rail) => {
      rail.position.z = centerGroundZ;
    });

    // Recycle container slices when they fall behind playerZ - 30
    const sliceSpan = 240; // 20 slices * 12m
    for (let i = 0; i < this.containerSliceGroups.length; i++) {
      const slice = this.containerSliceGroups[i];
      if (slice.group.position.z < this.playerZ - 30) {
        slice.group.position.z += sliceSpan;
      }
    }

    // Recycle overhead gantry cranes when they fall behind playerZ - 30
    const craneSpan = 240; // 4 cranes * 60m
    for (let i = 0; i < this.gantryCranes.length; i++) {
      const crane = this.gantryCranes[i];
      if (crane.group.position.z < this.playerZ - 30) {
        crane.group.position.z += craneSpan;
      }
    }

    // Keep NYC Skyline Backdrop always ahead
    if (this.skylineGroup) {
      this.skylineGroup.position.z = this.playerZ + 450;
    }

    // 9. Spatial Partitioning & Multithreaded Collision Offloading
    if (!this.isProcessingCollisions) {
      this.isProcessingCollisions = true;
      this.processCollisionsAndCollectibles()
        .catch((err) => console.error('Collision error:', err))
        .finally(() => {
          this.isProcessingCollisions = false;
        });
    }

    // 10. Batch Render Instanced Coins & Sleepers
    this.updateInstancedMeshes();

    // 11. Three.js Scene Render
    this.renderer.render(this.scene, this.camera);

    // Notify UI Stats - update every 3 frames to reduce React re-renders
    if (this.onStatsUpdateCallback && this.frameCount % 3 === 0) {
      const baseMult = this.stats.multiplier || 1;
      let effectiveMultiplier = baseMult + this.bonusMultiplier;
      if (this.activePowerUps.has('multiplier')) {
        effectiveMultiplier *= 2;
      }

      this.onStatsUpdateCallback(
        { ...this.stats, coins: this.coinsCollectedThisRun, multiplier: effectiveMultiplier },
        activePowerupList,
        {
          comboCount: this.comboCount,
          comboTimer: this.comboTimer,
          comboMaxTimer: this.comboMaxTimer,
          bonusMultiplier: this.bonusMultiplier,
          lastDodgeText: this.lastDodgeText,
          lastDodgeTimestamp: this.lastDodgeTimestamp,
        },
        Math.floor(this.runTimeSeconds)
      );
    }
  };

  /**
   * Trigger Dodge Combo when player successfully passes an obstacle
   */
  private triggerDodgeCombo(): void {
    this.comboCount++;
    this.comboTimer = this.comboMaxTimer;

    if (this.comboCount >= 8) {
      this.bonusMultiplier = 5;
    } else if (this.comboCount >= 5) {
      this.bonusMultiplier = 3;
    } else if (this.comboCount >= 3) {
      this.bonusMultiplier = 2;
    } else {
      this.bonusMultiplier = 1;
    }

    this.lastDodgeTimestamp = Date.now();
    if (this.comboCount === 1) {
      this.lastDodgeText = 'NÉ TRÁNH! +1x';
    } else if (this.comboCount < 5) {
      this.lastDodgeText = `COMBO x${this.comboCount}! +${this.bonusMultiplier}x MULTIPLIER`;
    } else if (this.comboCount < 8) {
      this.lastDodgeText = `SIÊU COMBO x${this.comboCount}! +${this.bonusMultiplier}x MULTIPLIER`;
    } else {
      this.lastDodgeText = `THẦN THOẠI x${this.comboCount}! +${this.bonusMultiplier}x MULTIPLIER`;
    }

    this.soundEngine.playCombo(this.comboCount);

    const { updatedStats, newlyCompletedTasks } = DailyChallengeManager.updateProgress(this.stats, 'dodge_combo', 1);
    this.stats = updatedStats;
    if (newlyCompletedTasks.length > 0 && this.onDailyChallengeCompletedCallback) {
      newlyCompletedTasks.forEach((task) => {
        this.onDailyChallengeCompletedCallback!({
          id: task.id,
          type: task.type,
          title: task.title,
          description: task.description,
          targetValue: task.targetValue,
          rewardCoins: task.rewardCoins,
          rewardHoverboards: task.rewardHoverboards || 0,
          icon: task.icon,
          color: task.color,
        });
      });
    }
  }

  /**
   * Offload physics & collision candidate queries to WorkerBridge
   */
  private async processCollisionsAndCollectibles(): Promise<void> {
    const hasMagnet = this.activePowerUps.has('magnet');
    const magnetLevel = this.stats.powerUpUpgrades?.magnetLevel || 1;
    const magnetRadius = 6 + magnetLevel * 2;

    const coinCount = this.trackGenerator.activeCoins.length;
    const obsCount = this.trackGenerator.activeObstacles.length;

    const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };

    if (!this.cachedTaskData || coinCount !== this.lastCoinCount || obsCount !== this.lastObstacleCount) {
      const coins = [];
      for (let i = 0; i < coinCount; i++) {
        const c = this.trackGenerator.activeCoins[i];
        coins.push({
          id: c.id,
          x: laneXMap[c.lane] ?? 0,
          y: c.positionY,
          z: c.positionZ,
          lane: c.lane,
          active: c.active && !c.collected,
        });
      }

      const obstacles = [];
      for (let i = 0; i < obsCount; i++) {
        const o = this.trackGenerator.activeObstacles[i];
        obstacles.push({
          id: o.id,
          type: o.type,
          lane: o.lane,
          z: o.positionZ,
          height: o.height,
          length: o.length,
          active: o.active,
        });
      }

      this.cachedTaskData = {
        playerPos: { x: this.playerX, y: this.playerY, z: this.playerZ, lane: this.currentLane },
        playerSize: { width: 0.8, height: this.isRolling ? 0.8 : 1.8, length: 0.8 },
        isRolling: this.isRolling,
        hasMagnet,
        hasJetpack: this.activePowerUps.has('jetpack'),
        magnetRadius,
        coins,
        obstacles,
      };

      this.lastCoinCount = coinCount;
      this.lastObstacleCount = obsCount;
    } else {
      this.cachedTaskData.playerPos.x = this.playerX;
      this.cachedTaskData.playerPos.y = this.playerY;
      this.cachedTaskData.playerPos.z = this.playerZ;
      this.cachedTaskData.playerPos.lane = this.currentLane;
      this.cachedTaskData.playerSize.height = this.isRolling ? 0.8 : 1.8;
      this.cachedTaskData.isRolling = this.isRolling;
      this.cachedTaskData.hasMagnet = hasMagnet;
      this.cachedTaskData.hasJetpack = this.activePowerUps.has('jetpack');
      this.cachedTaskData.magnetRadius = magnetRadius;

      for (let i = 0; i < coinCount; i++) {
        const c = this.trackGenerator.activeCoins[i];
        if (this.cachedTaskData.coins[i]) {
          this.cachedTaskData.coins[i].y = c.positionY;
          this.cachedTaskData.coins[i].z = c.positionZ;
          this.cachedTaskData.coins[i].active = c.active && !c.collected;
        }
      }
      for (let i = 0; i < obsCount; i++) {
        const o = this.trackGenerator.activeObstacles[i];
        if (this.cachedTaskData.obstacles[i]) {
          this.cachedTaskData.obstacles[i].active = o.active;
        }
      }
    }

    const result = await this.workerBridge.computePhysicsAsync(this.cachedTaskData);

    // Handle Coin Collections
    if (result.coinsCollected.length > 0) {
      const coinBonus = (this.stats.selectedCharacter === 'Gold Runner' || this.stats.selectedCharacter === 'Gold Emperor') ? 2 : 1;
      let totalNewCoinsInStep = 0;

      const coinMap = new Map();
      for (let i = 0; i < this.trackGenerator.activeCoins.length; i++) {
        const c = this.trackGenerator.activeCoins[i];
        coinMap.set(c.id, c);
      }

      for (const coinId of result.coinsCollected) {
        const coin = coinMap.get(coinId);
        if (coin && !coin.collected) {
          this.handleCollectCoin(coin, coinBonus);
          totalNewCoinsInStep += coinBonus;
        }
      }

      if (totalNewCoinsInStep > 0) {
        const { updatedStats, newlyCompletedTasks } = DailyChallengeManager.updateProgress(this.stats, 'collect_coins', totalNewCoinsInStep);
        this.stats = updatedStats;
        if (newlyCompletedTasks.length > 0 && this.onDailyChallengeCompletedCallback) {
          newlyCompletedTasks.forEach((task) => {
            this.onDailyChallengeCompletedCallback!({
              id: task.id,
              type: task.type,
              title: task.title,
              description: task.description,
              targetValue: task.targetValue,
              rewardCoins: task.rewardCoins,
              rewardHoverboards: task.rewardHoverboards || 0,
              icon: task.icon,
              color: task.color,
            });
          });
        }
      }
    }

    // Handle Magnetic Pull Updates
    if (result.magneticCoinsUpdated.length > 0) {
      const coinMap = new Map();
      for (let i = 0; i < this.trackGenerator.activeCoins.length; i++) {
        const c = this.trackGenerator.activeCoins[i];
        coinMap.set(c.id, c);
      }
      for (const mag of result.magneticCoinsUpdated) {
        const coin = coinMap.get(mag.id);
        if (coin && !coin.collected) {
          coin.positionY = mag.newY;
          coin.positionZ = mag.newZ;
        }
      }
    }

    // Handle Power-Up Item Collection
    for (const pup of this.trackGenerator.activePowerUps) {
      if (pup.active && !pup.collected) {
        const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };
        const pupX = laneXMap[pup.lane] ?? 0;
        const dz = Math.abs(this.playerZ - pup.positionZ);
        const dx = Math.abs(this.playerX - pupX);

        if (dz < 1.2 && dx < 1.2) {
          pup.collected = true;
          this.soundEngine.playPowerUp();

          let level = 1;
          if (pup.type === 'magnet') level = this.stats.permanentUpgrades?.magnetLevel || this.stats.powerUpUpgrades?.magnetLevel || 1;
          else if (pup.type === 'jetpack') level = this.stats.permanentUpgrades?.jetpackLevel || this.stats.powerUpUpgrades?.jetpackLevel || 1;
          else if (pup.type === 'multiplier') level = this.stats.permanentUpgrades?.multiplierLevel || this.stats.powerUpUpgrades?.multiplierLevel || 1;
          else if (pup.type === 'hoverboard') level = this.stats.permanentUpgrades?.hoverboardLevel || this.stats.powerUpUpgrades?.hoverboardLevel || 1;
          else if (pup.type === 'sneakers') level = this.stats.permanentUpgrades?.sneakersLevel || this.stats.powerUpUpgrades?.sneakersLevel || 1;

          const dur = 10 + (level - 1) * 2;

          // Always reset remaining duration to maximum default duration for this power-up type
          this.activePowerUps.set(pup.type, {
            type: pup.type,
            duration: dur,
            maxDuration: dur,
          });

          if (pup.type === 'hoverboard') this.character3D.setHoverboardActive(true);
          if (pup.type === 'jetpack') {
            this.jetpackTransitionTimer = 0;
            this.jetpackStartY = this.playerY;
            this.character3D.setJetpackActive(true);
          }

          const { updatedStats, newlyCompletedTasks } = DailyChallengeManager.updateProgress(this.stats, 'collect_powerups', 1);
          this.stats = updatedStats;
          if (newlyCompletedTasks.length > 0 && this.onDailyChallengeCompletedCallback) {
            newlyCompletedTasks.forEach((task) => {
              this.onDailyChallengeCompletedCallback!({
                id: task.id,
                type: task.type,
                title: task.title,
                description: task.description,
                targetValue: task.targetValue,
                rewardCoins: task.rewardCoins,
                rewardHoverboards: task.rewardHoverboards || 0,
                icon: task.icon,
                color: task.color,
              });
            });
          }
        }
      }
    }

    // Handle Crashes & Collisions
    if (result.collisions.length > 0 && !this.activePowerUps.has('jetpack') && this.invincibilityTimer <= 0) {
      this.handleCollision(result.collisions);
    }
  }

  /**
   * Calculates the standable ground height (e.g. ground level 0 or container/train roof top Y)
   */
  private getGroundY(playerX: number, playerZ: number): number {
    const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };
    let maxGroundY = 0;
    const isJetpackActive = this.activePowerUps.has('jetpack');

    for (const obs of this.trackGenerator.activeObstacles) {
      if (!obs.active) continue;
      if (obs.type === 'train' || obs.type === 'cargo_container' || obs.type === 'ramp') {
        const obsX = laneXMap[obs.lane] ?? 0;
        const dx = Math.abs(playerX - obsX);

        if (dx < 1.35) {
          const halfL = obs.length / 2;
          const minZ = obs.positionZ - halfL - 0.2;
          const maxZ = obs.positionZ + halfL + 0.2;

          if (playerZ >= minZ && playerZ <= maxZ) {
            if (obs.type === 'ramp') {
              const progress = Math.min(1, Math.max(0, (playerZ - (obs.positionZ - halfL)) / obs.length));
              const rampY = progress * obs.height;
              if (rampY > maxGroundY) maxGroundY = rampY;
            } else if (isJetpackActive) {
              // ONLY allow container/train roof height when jetpack powerup is active
              if (obs.height > maxGroundY) {
                maxGroundY = obs.height;
              }
            }
          }
        }
      }
    }

    return maxGroundY;
  }

  /**
   * Handle coin collection with sound and subtle haptic vibration feedback
   */
  private handleCollectCoin(coin: { collected: boolean }, coinBonus: number): void {
    coin.collected = true;
    this.coinsCollectedThisRun += coinBonus;
    this.stats.totalCoinsCollected = (this.stats.totalCoinsCollected || 0) + coinBonus;
    this.soundEngine.playCoin();

    // Subtle vibration trigger when supported by environment
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore if blocked by browser permission policy
      }
    }
  }

  /**
   * Handle obstacle collision with haptic vibration feedback, shield check & game over
   */
  private handleCollision(collidedObstacleIds: string[]): void {
    // Subtle/impact vibration trigger when supported by environment
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([40, 30, 80]);
      } catch {
        // Ignore if blocked by browser permission policy
      }
    }

    if (this.activePowerUps.has('hoverboard')) {
      // Hoverboard Shield consumed on crash!
      this.activePowerUps.delete('hoverboard');
      this.character3D.setHoverboardActive(false);
      this.invincibilityTimer = 1.8; // 1.8 seconds invincibility frame
      this.soundEngine.playCrash();

      // Deactivate collided obstacles so player passes safely through
      for (const obsId of collidedObstacleIds) {
        const obs = this.trackGenerator.activeObstacles.find((o) => o.id === obsId);
        if (obs) {
          obs.active = false;
        }
      }
    } else {
      // Game Over!
      this.handleCrashGameOver();
    }
  }

  /**
   * Batch update instanced geometries for Coins, Sleepers & Pillars
   */
  private updateInstancedMeshes(): void {
    const laneXMap: Record<number, number> = { [-1]: 2.5, [0]: 0, [1]: -2.5 };
    const now = performance.now();

    if (now - this.lastFormattedCoinsTime > this.coinFormatCacheMs) {
      const isJetpackActive = this.activePowerUps.has('jetpack');
      const nowRot = Date.now() * 0.004;

      const formattedCoins = [];
      for (let i = 0; i < this.trackGenerator.activeCoins.length; i++) {
        const c = this.trackGenerator.activeCoins[i];
        if (!c.active || c.collected || c.positionZ < this.playerZ - 10 || c.positionZ > this.playerZ + 220) {
          continue;
        }
        if (c.positionY >= 5.0 && !isJetpackActive) {
          continue;
        }

        formattedCoins.push({
          x: laneXMap[c.lane] ?? 0,
          y: c.positionY,
          z: c.positionZ,
          rotationY: nowRot,
          active: true,
        });
      }

      formattedCoins.sort((a, b) => a.z - b.z);
      this.lastFormattedCoins = formattedCoins;
      this.lastFormattedCoinsTime = now;
    }

    this.gpuInstancer.updateCoins(this.lastFormattedCoins);
    this.gpuInstancer.updateSleepersFast(this.playerZ);
    this.gpuInstancer.updatePillarsFast(this.playerZ);
  }

  /**
   * Handle Crash & Game Over
   */
  private handleCrashGameOver(): void {
    this.isRunning = false;
    this.isGameOver = true;

    this.comboCount = 0;
    this.comboTimer = 0;
    this.bonusMultiplier = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.soundEngine.stopBGM();
    this.soundEngine.playCrash();

    if (this.stats.currentScore > this.stats.highScore) {
      this.stats.highScore = this.stats.currentScore;
    }

    const finalRunTime = Math.floor(this.runTimeSeconds);
    if (this.stats.longestTime === undefined || finalRunTime > this.stats.longestTime) {
      this.stats.longestTime = finalRunTime;
    }

    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.stats.currentScore, this.coinsCollectedThisRun, finalRunTime, this.stats.distance);
    }
  }

  /**
   * Send performance metrics to dashboard UI
   */
  private emitPerformanceMetrics(): void {
    if (!this.onPerformanceUpdateCallback) return;

    const poolTelemetry = this.trackGenerator.getPoolTelemetry();
    const renderInfo = this.renderer.info;

    this.onPerformanceUpdateCallback({
      fps: this.currentFps,
      frameTimeMs: this.frameTimeMs,
      drawCalls: renderInfo.render.calls,
      triangles: renderInfo.render.triangles,
      geometries: renderInfo.memory.geometries,
      textures: renderInfo.memory.textures,
      activePoolObjects: poolTelemetry.activeObstacles + poolTelemetry.activeCoins + poolTelemetry.activePowerUps,
      totalPoolObjects: 255,
      spatialGridNodes: this.spatialGrid.getActiveCellCount(),
      workerLatencyMs: this.workerBridge.getLatencyMs(),
    });
  }

  /**
   * Dynamically sync updated PlayerStats from Shop into running 3D Engine
   */
  public updatePlayerStats(newStats: PlayerStats): void {
    this.stats = { ...newStats };
    if (this.character3D) {
      const activeSkin = ItemManager.getSelectedSkinForCharacter(this.stats, this.stats.selectedCharacter || 'Jake Hero');
      this.character3D.buildCharacter(this.stats.selectedCharacter || 'Jake Hero', activeSkin);
      this.character3D.buildHoverboard(this.stats.selectedBoard || 'Star Board');
      this.character3D.buildJetpack();
    }
  }

  /**
   * Set Graphics Quality Preset
   */
  public setGraphicsQuality(quality: 'high' | 'medium' | 'low'): void {
    if (quality === 'low') {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(1.25);
      this.renderer.shadowMap.enabled = true;
      if (this.dirLight && this.dirLight.shadow) {
        this.dirLight.shadow.mapSize.set(512, 512);
        if (this.dirLight.shadow.map) {
          this.dirLight.shadow.map.dispose();
          this.dirLight.shadow.map = null as any;
        }
      }
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      if (this.dirLight && this.dirLight.shadow) {
        this.dirLight.shadow.mapSize.set(1024, 1024);
        if (this.dirLight.shadow.map) {
          this.dirLight.shadow.map.dispose();
          this.dirLight.shadow.map = null as any;
        }
      }
    }
  }

  /**
   * Handle Window / Container Resize
   */
  public resize = (): void => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onResize = (): void => {
    this.resize();
  };

  /**
   * Destroy Engine & Clean up WebGL Context
   */
  public dispose(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener('resize', this.onResize);
    this.touchManager.detach();
    this.gpuInstancer.dispose();
    this.soundEngine.stopBGM();

    this.scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
