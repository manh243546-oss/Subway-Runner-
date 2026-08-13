/**
 * Procedural 3D Runner Character Model with Animation, Costumes & Particle Effects
 * Supports Characters: Jake Hero, Ninja, Cyberpunk, Neon Runner, Gold Runner, Tricky Skater, Yutani Tech
 * Dynamic Hoverboards & Particle Trails: Flame Board, Plasma Jet, Hover Neon, Rainbow Wave
 */

import * as THREE from 'three';
import { CharacterSkin } from '../types';

export interface ParticleObject {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  startScale: number;
  endScale: number;
  colorStart: THREE.Color;
  colorEnd: THREE.Color;
  type: 'flame' | 'plasma' | 'neon' | 'rainbow' | 'sparkle' | 'smoke';
}

export class Character3D {
  public group: THREE.Group;
  public meshContainer: THREE.Group;
  private particlesGroup: THREE.Group;

  // Body parts for procedural skeletal animation
  private headMesh: THREE.Mesh = new THREE.Mesh();
  private torsoMesh: THREE.Mesh = new THREE.Mesh();
  private leftArm: THREE.Group = new THREE.Group();
  private rightArm: THREE.Group = new THREE.Group();
  private leftLeg: THREE.Group = new THREE.Group();
  private rightLeg: THREE.Group = new THREE.Group();

  // Special accessories
  private skinAccessories: THREE.Group = new THREE.Group();

  // Equipment
  private hoverboardGroup: THREE.Group = new THREE.Group();
  private jetpackGroup: THREE.Group = new THREE.Group();
  private jetpackFlames: THREE.Mesh[] = [];

  // Active Particle Pool
  private activeParticles: ParticleObject[] = [];

  // Animation parameters
  private runTime: number = 0;
  private characterType: string = 'Jake Hero';
  private boardType: string = 'Star Board';

  constructor() {
    this.group = new THREE.Group();
    this.meshContainer = new THREE.Group();
    this.particlesGroup = new THREE.Group();

    this.group.add(this.meshContainer);
    this.group.add(this.particlesGroup);

    this.buildCharacter('Jake Hero');
    this.buildHoverboard('Star Board');
    this.buildJetpack();
  }

  /**
   * Rebuild character visual mesh according to selected costume skin
   */
  public buildCharacter(skin: string, customSkinObj?: CharacterSkin): void {
    this.characterType = skin;

    // Clear old children
    while (this.meshContainer.children.length > 0) {
      this.meshContainer.remove(this.meshContainer.children[0]);
    }
    this.skinAccessories = new THREE.Group();

    let torsoColor = 0xef4444; // Red jacket (Jake)
    let pantsColor = 0x1e3a8a; // Blue jeans
    let skinColor = 0xffdbac;
    let hairColor = 0xf59e0b;
    let hatColor = 0x111827;
    let emissiveColor = 0x000000;
    let emissiveIntensity = 0;
    let accessory = customSkinObj?.accessoryType;

    if (customSkinObj) {
      if (customSkinObj.torsoColorHex !== undefined) torsoColor = customSkinObj.torsoColorHex;
      if (customSkinObj.pantsColorHex !== undefined) pantsColor = customSkinObj.pantsColorHex;
      if (customSkinObj.hairColorHex !== undefined) hairColor = customSkinObj.hairColorHex;
      if (customSkinObj.hatColorHex !== undefined) hatColor = customSkinObj.hatColorHex;
      if (customSkinObj.emissiveHex !== undefined) emissiveColor = customSkinObj.emissiveHex;
      if (customSkinObj.emissiveIntensity !== undefined) emissiveIntensity = customSkinObj.emissiveIntensity;
    } else {
      if (skin === 'Ninja' || skin === 'Cyber Ninja') {
        torsoColor = 0x0f172a;
        pantsColor = 0x1e293b;
        skinColor = 0x334155;
        hairColor = 0xef4444;
        hatColor = 0x020617;
        emissiveColor = 0xd97706;
        accessory = 'scarf';
      } else if (skin === 'Cyberpunk') {
        torsoColor = 0x0284c7;
        pantsColor = 0x475569;
        skinColor = 0xfc6d26;
        hairColor = 0xf43f5e;
        hatColor = 0x06b6d4;
        emissiveColor = 0x06b6d4;
        emissiveIntensity = 0.5;
        accessory = 'glasses';
      } else if (skin === 'Neon Runner') {
        torsoColor = 0x10b981;
        pantsColor = 0x064e3b;
        skinColor = 0xffdbac;
        hairColor = 0xa3e635;
        hatColor = 0x10b981;
        emissiveColor = 0xa3e635;
        emissiveIntensity = 0.8;
      } else if (skin === 'Gold Runner' || skin === 'Gold Emperor') {
        torsoColor = 0xf59e0b;
        pantsColor = 0xd97706;
        skinColor = 0xfef08a;
        hairColor = 0xfef08a;
        hatColor = 0xb45309;
        emissiveColor = 0xfacc15;
        emissiveIntensity = 0.6;
        accessory = 'crown';
      } else if (skin === 'Tricky Skater') {
        torsoColor = 0xec4899;
        pantsColor = 0x475569;
        hairColor = 0x8b5cf6;
        hatColor = 0xec4899;
      } else if (skin === 'Yutani Tech') {
        torsoColor = 0x10b981;
        pantsColor = 0x065f46;
        hairColor = 0x06b6d4;
        hatColor = 0x0f766e;
      }
    }

    const matTorso = new THREE.MeshStandardMaterial({
      color: torsoColor,
      roughness: skin.includes('Gold') || customSkinObj?.id.includes('gold') ? 0.2 : 0.5,
      metalness: skin.includes('Gold') || customSkinObj?.id.includes('gold') ? 0.9 : 0.1,
      emissive: emissiveColor,
      emissiveIntensity: emissiveIntensity,
    });
    const matPants = new THREE.MeshStandardMaterial({
      color: pantsColor,
      roughness: 0.6,
      metalness: skin.includes('Gold') || customSkinObj?.id.includes('gold') ? 0.8 : 0.0,
    });
    const matSkin = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.4 });
    const matHat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.5 });

    // Torso (0.5w x 0.7h x 0.3d)
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
    this.torsoMesh = new THREE.Mesh(torsoGeo, matTorso);
    this.torsoMesh.position.y = 1.05;
    this.torsoMesh.castShadow = true;
    this.meshContainer.add(this.torsoMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    this.headMesh = new THREE.Mesh(headGeo, matSkin);
    this.headMesh.position.y = 1.6;
    this.headMesh.castShadow = true;
    this.meshContainer.add(this.headMesh);

    // Headwear Accessories per skin
    if (accessory === 'scarf' || skin === 'Ninja') {
      // Red Ninja Headband & Scarf
      const scarfMat = new THREE.MeshBasicMaterial({ color: hairColor });
      const bandGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 16);
      const bandMesh = new THREE.Mesh(bandGeo, scarfMat);
      bandMesh.position.set(0, 1.65, 0);
      bandMesh.rotation.x = Math.PI / 2;
      this.meshContainer.add(bandMesh);

      // Scarf Tail trailing behind
      const tailGeo = new THREE.BoxGeometry(0.08, 0.4, 0.02);
      const tailMesh = new THREE.Mesh(tailGeo, scarfMat);
      tailMesh.position.set(0, 1.5, -0.28);
      tailMesh.rotation.x = -0.5;
      this.meshContainer.add(tailMesh);
    } else if (accessory === 'glasses') {
      // Neon Visor Glasses
      const visorGeo = new THREE.BoxGeometry(0.3, 0.08, 0.26);
      const visorMat = new THREE.MeshBasicMaterial({ color: hatColor });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 1.62, 0.06);
      this.meshContainer.add(visorMesh);
    } else if (accessory === 'crown') {
      // Golden Crown
      const crownGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.16, 6);
      const crownMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.95, roughness: 0.1 });
      const crownMesh = new THREE.Mesh(crownGeo, crownMat);
      crownMesh.position.set(0, 1.78, 0);
      this.meshContainer.add(crownMesh);
    } else if (accessory === 'freight_helmet') {
      // Industrial Freight Hardhat (Mũ bảo hộ công-ten-nơ New York)
      const helmetGeo = new THREE.CylinderGeometry(0.28, 0.26, 0.14, 16);
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0xfab005, roughness: 0.3, metalness: 0.2 });
      const helmetMesh = new THREE.Mesh(helmetGeo, helmetMat);
      helmetMesh.position.set(0, 1.76, 0);

      const brimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.02, 16);
      const brimMesh = new THREE.Mesh(brimGeo, helmetMat);
      brimMesh.position.set(0, 1.71, 0.04);

      this.meshContainer.add(helmetMesh);
      this.meshContainer.add(brimMesh);
    } else if (accessory === 'headphones') {
      // DJ Headphones
      const hpGeo = new THREE.TorusGeometry(0.26, 0.03, 8, 16);
      const hpMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.3 });
      const hpMesh = new THREE.Mesh(hpGeo, hpMat);
      hpMesh.position.set(0, 1.66, 0);
      hpMesh.rotation.z = Math.PI / 2;
      this.meshContainer.add(hpMesh);
    } else {
      // Cap / Snapback
      const hatGeo = new THREE.ConeGeometry(0.26, 0.2, 16);
      const hatMesh = new THREE.Mesh(hatGeo, matHat);
      hatMesh.position.set(0, 1.75, -0.05);
      hatMesh.rotation.x = -0.3;
      this.meshContainer.add(hatMesh);
    }

    // Backpack accessory
    if (accessory === 'backpack') {
      const packGeo = new THREE.BoxGeometry(0.36, 0.45, 0.18);
      const packMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.6 });
      const packMesh = new THREE.Mesh(packGeo, packMat);
      packMesh.position.set(0, 1.05, -0.22);
      this.meshContainer.add(packMesh);
    }

    // Left Arm
    this.leftArm = new THREE.Group();
    const armGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.6, 8);
    armGeo.translate(0, -0.3, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, matTorso);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.leftArm.position.set(-0.32, 1.35, 0);
    this.meshContainer.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    const rightArmMesh = new THREE.Mesh(armGeo, matTorso);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.rightArm.position.set(0.32, 1.35, 0);
    this.meshContainer.add(this.rightArm);

    // Left Leg
    this.leftLeg = new THREE.Group();
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.7, 8);
    legGeo.translate(0, -0.35, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, matPants);
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    this.leftLeg.position.set(-0.16, 0.7, 0);
    this.meshContainer.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    const rightLegMesh = new THREE.Mesh(legGeo, matPants);
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    this.rightLeg.position.set(0.16, 0.7, 0);
    this.meshContainer.add(this.rightLeg);

    // Rebuild jetpack group onto meshContainer
    this.buildJetpack();
  }

  /**
   * Build 3D Hoverboard model with custom visual aesthetics per skin
   */
  public buildHoverboard(boardSkin: string): void {
    this.boardType = boardSkin;
    if (this.hoverboardGroup.parent) {
      this.group.remove(this.hoverboardGroup);
    }
    this.hoverboardGroup = new THREE.Group();

    let boardColor = 0x3b82f6; // Blue Star Board
    let glowColor = 0x60a5fa;

    if (boardSkin === 'Flame Board' || boardSkin === 'Flame Thruster') {
      boardColor = 0xd97706; // Flaming Red-Orange
      glowColor = 0xf59e0b;
    } else if (boardSkin === 'Plasma Jet' || boardSkin === 'Cyber Hover') {
      boardColor = 0x0284c7; // Plasma Blue/Cyan
      glowColor = 0x38bdf8;
    } else if (boardSkin === 'Hover Neon' || boardSkin === 'Neon Pulse') {
      boardColor = 0xa855f7; // Neon Violet
      glowColor = 0xe879f9;
    } else if (boardSkin === 'Rainbow Wave') {
      boardColor = 0xfacc15; // Golden Rainbow Base
      glowColor = 0xf43f5e;
    }

    const boardMat = new THREE.MeshStandardMaterial({
      color: boardColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: glowColor,
      emissiveIntensity: 0.5,
    });

    const boardGeo = new THREE.BoxGeometry(0.5, 0.08, 1.6);
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.y = 0.1;
    this.hoverboardGroup.add(boardMesh);

    // Hover thruster rings
    const ringGeo = new THREE.TorusGeometry(0.16, 0.04, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: glowColor });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(0, 0.02, 0.5);
    const ring2 = ring1.clone();
    ring2.position.set(0, 0.02, -0.5);

    this.hoverboardGroup.add(ring1);
    this.hoverboardGroup.add(ring2);

    // Double flame exhaust nozzles for Flame Board
    if (boardSkin === 'Flame Board' || boardSkin === 'Flame Thruster') {
      const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.25, 12);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
      const n1 = new THREE.Mesh(nozzleGeo, nozzleMat);
      n1.rotation.x = Math.PI / 2;
      n1.position.set(-0.16, 0.08, -0.85);
      const n2 = n1.clone();
      n2.position.set(0.16, 0.08, -0.85);
      this.hoverboardGroup.add(n1);
      this.hoverboardGroup.add(n2);
    }

    this.hoverboardGroup.visible = false;
    this.group.add(this.hoverboardGroup);
  }

  /**
   * Build 3D Jetpack Thrusters
   */
  public buildJetpack(): void {
    this.jetpackGroup = new THREE.Group();
    const packMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });

    const tankGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
    const tank1 = new THREE.Mesh(tankGeo, packMat);
    tank1.position.set(-0.16, 1.1, -0.22);
    const tank2 = new THREE.Mesh(tankGeo, packMat);
    tank2.position.set(0.16, 1.1, -0.22);

    this.jetpackGroup.add(tank1);
    this.jetpackGroup.add(tank2);

    // Flame effects
    const flameGeo = new THREE.ConeGeometry(0.1, 0.4, 8);
    flameGeo.rotateX(Math.PI);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });

    const flame1 = new THREE.Mesh(flameGeo, flameMat);
    flame1.position.set(-0.16, 0.6, -0.22);
    const flame2 = new THREE.Mesh(flameGeo, flameMat);
    flame2.position.set(0.16, 0.6, -0.22);

    this.jetpackFlames = [flame1, flame2];
    this.jetpackGroup.add(flame1);
    this.jetpackGroup.add(flame2);

    this.jetpackGroup.visible = false;
    this.meshContainer.add(this.jetpackGroup);
  }

  /**
   * Set Jetpack Active visibility
   */
  public setJetpackActive(active: boolean): void {
    this.jetpackGroup.visible = active;
  }

  /**
   * Set Hoverboard Active visibility
   */
  public setHoverboardActive(active: boolean): void {
    this.hoverboardGroup.visible = active;
  }

  /**
   * Spawn a 3D Particle into the scene
   */
  private spawnParticle(config: {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    maxLife: number;
    startScale: number;
    endScale: number;
    colorStart: THREE.Color;
    colorEnd: THREE.Color;
    type: 'flame' | 'plasma' | 'neon' | 'rainbow' | 'sparkle' | 'smoke';
  }): void {
    const geo =
      config.type === 'rainbow'
        ? new THREE.PlaneGeometry(0.5, 0.15)
        : config.type === 'plasma'
        ? new THREE.OctahedronGeometry(0.08, 0)
        : new THREE.BoxGeometry(0.1, 0.1, 0.1);

    const mat = new THREE.MeshBasicMaterial({
      color: config.colorStart,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(config.position);
    if (config.type === 'rainbow') {
      mesh.rotation.x = -Math.PI / 2;
    }
    mesh.scale.setScalar(config.startScale);
    this.particlesGroup.add(mesh);

    this.activeParticles.push({
      mesh,
      velocity: config.velocity,
      life: 0,
      maxLife: config.maxLife,
      startScale: config.startScale,
      endScale: config.endScale,
      colorStart: config.colorStart,
      colorEnd: config.colorEnd,
      type: config.type,
    });
  }

  /**
   * Update Particle Lifecycle (Movement, Color Interpolation, Fade-Out)
   */
  public updateParticles(delta: number, isRunning: boolean): void {
    // 1. Particle Tick Update
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particlesGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (Array.isArray(p.mesh.material)) {
          p.mesh.material.forEach((m) => m.dispose());
        } else {
          p.mesh.material.dispose();
        }
        this.activeParticles.splice(i, 1);
        continue;
      }

      const progress = p.life / p.maxLife;

      // Translate particle position
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Lerp Scale
      const currentScale = THREE.MathUtils.lerp(p.startScale, p.endScale, progress);
      p.mesh.scale.setScalar(currentScale);

      // Lerp Color & Opacity Fade
      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.color.lerpColors(p.colorStart, p.colorEnd, progress);
      mat.opacity = 1.0 - progress;
    }

    if (!isRunning) return;

    // 2. Spawn Board Specific Trail Effects
    if (this.hoverboardGroup.visible) {
      const charPos = this.group.position;

      // A. Flame Board Trail
      if (this.boardType === 'Flame Board' || this.boardType === 'Flame Thruster') {
        for (let k = 0; k < 2; k++) {
          const offsetX = (Math.random() - 0.5) * 0.4;
          this.spawnParticle({
            position: new THREE.Vector3(charPos.x + offsetX, charPos.y + 0.15, charPos.z - 0.7),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0.4 + Math.random() * 0.5, -4.0 - Math.random() * 2),
            maxLife: 0.35,
            startScale: 0.18,
            endScale: 0.35,
            colorStart: new THREE.Color(0xffcc00),
            colorEnd: new THREE.Color(0xff2200),
            type: 'flame',
          });
        }
      }

      // B. Plasma Jet Trail
      else if (this.boardType === 'Plasma Jet' || this.boardType === 'Cyber Hover') {
        const sparkColors = [new THREE.Color(0x00f0ff), new THREE.Color(0xd946ef), new THREE.Color(0x3b82f6)];
        for (let k = 0; k < 2; k++) {
          const c = sparkColors[Math.floor(Math.random() * sparkColors.length)];
          this.spawnParticle({
            position: new THREE.Vector3(
              charPos.x + (Math.random() - 0.5) * 0.6,
              charPos.y + 0.1 + (Math.random() - 0.5) * 0.3,
              charPos.z + (Math.random() - 0.5) * 1.2
            ),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
            maxLife: 0.2,
            startScale: 0.15,
            endScale: 0.02,
            colorStart: c,
            colorEnd: new THREE.Color(0xffffff),
            type: 'plasma',
          });
        }
      }

      // C. Hover Neon Trail
      else if (this.boardType === 'Hover Neon' || this.boardType === 'Neon Pulse') {
        this.spawnParticle({
          position: new THREE.Vector3(charPos.x + (Math.random() - 0.5) * 0.3, charPos.y + 0.05, charPos.z - 0.4),
          velocity: new THREE.Vector3(0, 0.8 + Math.random() * 0.5, -2.0),
          maxLife: 0.4,
          startScale: 0.25,
          endScale: 0.05,
          colorStart: new THREE.Color(0xe879f9),
          colorEnd: new THREE.Color(0x8b5cf6),
          type: 'neon',
        });
      }

      // D. Rainbow Wave Trail
      else if (this.boardType === 'Rainbow Wave') {
        const rainbowColors = [
          new THREE.Color(0xef4444),
          new THREE.Color(0xf97316),
          new THREE.Color(0xeab308),
          new THREE.Color(0x22c55e),
          new THREE.Color(0x06b6d4),
          new THREE.Color(0x3b82f6),
          new THREE.Color(0xa855f7),
        ];
        const step = Math.floor(performance.now() / 80) % rainbowColors.length;
        this.spawnParticle({
          position: new THREE.Vector3(charPos.x, charPos.y + 0.04, charPos.z - 0.5),
          velocity: new THREE.Vector3(0, 0.05, -1.0),
          maxLife: 0.6,
          startScale: 0.4,
          endScale: 0.45,
          colorStart: rainbowColors[step],
          colorEnd: rainbowColors[(step + 1) % rainbowColors.length],
          type: 'rainbow',
        });
      }
    }

    // 3. Skin Specific Auras
    if (this.characterType === 'Gold Runner' || this.characterType === 'Gold Emperor') {
      if (Math.random() < 0.3) {
        const charPos = this.group.position;
        this.spawnParticle({
          position: new THREE.Vector3(
            charPos.x + (Math.random() - 0.5) * 0.6,
            charPos.y + 0.5 + Math.random() * 1.2,
            charPos.z + (Math.random() - 0.5) * 0.5
          ),
          velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.6 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3),
          maxLife: 0.4,
          startScale: 0.08,
          endScale: 0.01,
          colorStart: new THREE.Color(0xfacc15),
          colorEnd: new THREE.Color(0xffffff),
          type: 'sparkle',
        });
      }
    }
  }

  /**
   * Update Procedural Skeletal Animation
   */
  public animate(delta: number, speed: number, isJumping: boolean, isRolling: boolean, hasHoverboard: boolean, isJetpack: boolean = false): void {
    this.runTime += delta * speed * 0.8;

    // Reset arm and leg Z-rotations to 0 by default
    this.leftArm.rotation.z = 0;
    this.rightArm.rotation.z = 0;
    this.leftLeg.rotation.z = 0;
    this.rightLeg.rotation.z = 0;

    const isFlying = isJetpack || this.jetpackGroup.visible;

    if (isFlying) {
      // Horizontal Superman / Gliding flying pose on Jetpack
      this.hoverboardGroup.visible = false;
      this.meshContainer.position.y = 0.6 + Math.sin(this.runTime * 3) * 0.08;
      this.meshContainer.scale.set(1, 1, 1);
      this.meshContainer.rotation.x = Math.PI * 0.45; // ~81 degrees tilt forward (body parallel to ground, head forward)
      this.meshContainer.rotation.z = Math.sin(this.runTime * 2) * 0.05; // Gentle flight roll sway

      // Arms reaching forward & spread outward (flying / skydiving pose)
      this.leftArm.rotation.x = -1.6;
      this.leftArm.rotation.z = -0.6;
      this.rightArm.rotation.x = -1.6;
      this.rightArm.rotation.z = 0.6;

      // Legs extended straight back together without running swing
      this.leftLeg.rotation.x = 0.1 + Math.sin(this.runTime * 2.5) * 0.04;
      this.leftLeg.rotation.z = 0.05;
      this.rightLeg.rotation.x = 0.1 - Math.sin(this.runTime * 2.5) * 0.04;
      this.rightLeg.rotation.z = -0.05;
    } else if (hasHoverboard) {
      // Surfing pose on hoverboard
      this.hoverboardGroup.visible = true;
      this.meshContainer.position.y = 0.2;
      this.meshContainer.scale.set(1, 1, 1);
      this.meshContainer.rotation.x = 0;
      this.meshContainer.rotation.z = Math.sin(this.runTime * 2) * 0.05;

      this.leftArm.rotation.x = -0.6;
      this.rightArm.rotation.x = 0.6;
      this.leftLeg.rotation.x = 0.4;
      this.rightLeg.rotation.x = -0.4;
    } else if (isRolling) {
      // Crouch / Slide pose: crouch low without spinning or rotating whole body
      this.hoverboardGroup.visible = false;
      this.meshContainer.position.y = -0.35; // Lower body center close to ground
      this.meshContainer.scale.set(1, 0.45, 1); // Compress height along Y axis
      this.meshContainer.rotation.x = 0.25; // Slight forward tilt for sliding posture
      this.meshContainer.rotation.z = 0;

      // Arms tucked back/low, knees bent forward for slide stance
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -1.2;
      this.leftLeg.rotation.x = 1.3;
      this.rightLeg.rotation.x = 1.3;
    } else if (isJumping) {
      // Jump pose
      this.hoverboardGroup.visible = false;
      this.meshContainer.position.y = 0;
      this.meshContainer.scale.set(1, 1, 1);
      this.meshContainer.rotation.x = 0;
      this.meshContainer.rotation.z = 0;

      this.leftArm.rotation.x = -2.2;
      this.rightArm.rotation.x = -2.2;
      this.leftLeg.rotation.x = -0.5;
      this.rightLeg.rotation.x = 0.5;
    } else {
      // High-speed running leg/arm swing cycle
      this.hoverboardGroup.visible = false;
      this.meshContainer.position.y = Math.abs(Math.sin(this.runTime * 4)) * 0.12;
      this.meshContainer.scale.set(1, 1, 1);
      this.meshContainer.rotation.x = 0.08; // Slight lean forward
      this.meshContainer.rotation.z = 0;

      const armSwing = Math.sin(this.runTime * 4) * 0.85;
      const legSwing = Math.sin(this.runTime * 4) * 0.95;

      this.leftArm.rotation.x = armSwing;
      this.rightArm.rotation.x = -armSwing;

      this.leftLeg.rotation.x = -legSwing;
      this.rightLeg.rotation.x = legSwing;
    }

    // Jetpack flame pulse animation
    if (this.jetpackGroup.visible) {
      const scale = 0.8 + Math.random() * 0.4;
      this.jetpackFlames.forEach((f) => f.scale.set(scale, scale * 1.5, scale));
    }
  }
}
