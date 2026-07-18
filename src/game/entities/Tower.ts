import Phaser from 'phaser';
import { TowerConfig } from '../types';
import { calculateDamage, isInRange, selectTarget, calculateBonusDamage } from '../logic/combat';
import { calculateSellPrice } from '../logic/economy';
import { GAME_CONFIG } from '../config';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import type { AbilitySystem } from '../systems/AbilitySystem';

interface GameSceneInterface {
  getEnemies(): Enemy[];
  addProjectile(projectile: Projectile): void;
  getAbilitySystem?(): AbilitySystem;
}

export class Tower extends Phaser.GameObjects.Container {
  public config: TowerConfig;
  public level: number = 0;
  public slotId: string;

  private sprite: Phaser.GameObjects.Image;
  private rangeCircle: Phaser.GameObjects.Graphics;
  private lastFireTime: number = 0;
  private showingRange: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: TowerConfig,
    slotId: string
  ) {
    super(scene, x, y);

    this.config = config;
    this.slotId = slotId;

    this.sprite = scene.add.image(0, 0, `tower_${config.id}`);
    this.add(this.sprite);

    this.rangeCircle = scene.add.graphics();
    this.add(this.rangeCircle);
    this.rangeCircle.setVisible(false);

    this.setSize(this.sprite.width || 48, this.sprite.height || 48);
    this.setInteractive();

    scene.add.existing(this);
  }

  update(time: number, delta: number): void {
    const cooldown = this.getFireRate();
    if (time - this.lastFireTime < cooldown) return;

    const gameScene = this.scene as unknown as GameSceneInterface;
    const enemies = gameScene.getEnemies();

    // Check if legit traffic is immune (Traffic Reroute ability)
    const abilitySystem = gameScene.getAbilitySystem?.();
    const legitImmune = abilitySystem?.isLegitImmune() ?? false;
    const effectiveCanHitLegit = legitImmune ? false : this.config.canHitLegitimate;

    const targetList = enemies
      .filter((e) => e.isAlive)
      .map((enemy) => ({
        position: { x: enemy.x, y: enemy.y },
        distanceOnPath: enemy.distanceOnPath,
        isLegitimate: enemy.isLegitimate,
        health: enemy.currentHealth,
      }));

    const targetIndex = selectTarget(
      { x: this.x, y: this.y },
      this.getRange(),
      targetList,
      this.config.targetingMode,
      effectiveCanHitLegit
    );

    if (targetIndex === null) return;

    const aliveEnemies = enemies.filter((e) => e.isAlive);
    const target = aliveEnemies[targetIndex];
    if (!target) return;

    this.fireAt(target, abilitySystem);
    this.lastFireTime = time;
  }

  getRange(): number {
    return this.config.upgrades[this.level].range;
  }

  getFireRate(): number {
    return this.config.upgrades[this.level].fireRate;
  }

  getDamage(): number {
    return calculateDamage(this.config.upgrades[this.level].damage, this.level);
  }

  upgrade(): void {
    if (this.level < 2) {
      this.level++;
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
      });
    }
  }

  getSellPrice(): number {
    return calculateSellPrice(this.config.cost, this.level, GAME_CONFIG.sellMultiplier);
  }

  showRange(): void {
    this.rangeCircle.clear();
    const range = this.getRange();
    const color = this.getTowerColor();
    // Dashed circle outline at low alpha
    const segments = 32;
    this.rangeCircle.lineStyle(1, color, 0.2);
    for (let i = 0; i < segments; i += 2) {
      const startAngle = (Math.PI * 2 * i) / segments;
      const endAngle = (Math.PI * 2 * (i + 1)) / segments;
      this.rangeCircle.beginPath();
      this.rangeCircle.arc(0, 0, range, startAngle, endAngle, false);
      this.rangeCircle.strokePath();
    }
    this.rangeCircle.setVisible(true);
    this.showingRange = true;
  }

  hideRange(): void {
    this.rangeCircle.setVisible(false);
    this.showingRange = false;
  }

  private getTowerColor(): number {
    const colors: Record<string, number> = {
      firewall: 0x0076a8,
      ids: 0x753bbd,
      waf: 0xf47f28,
      honeypot: 0xe7d747,
      rate_limiter: 0x0093b2,
      packet_inspector: 0x84bd00,
      data_diode: 0x84bd00,
      network_segmentation: 0xe7d747,
    };
    return colors[this.config.id] ?? 0x0076a8;
  }

  private fireAt(target: Enemy, abilitySystem?: AbilitySystem): void {
    this.emit('tower-fired', this, target);

    // Muzzle flash animation: scale pulse
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 50,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    let damage = this.getDamage();
    damage = calculateBonusDamage(damage, target.config.id, this.config.bonusVs);

    // Apply ability damage multiplier (Threat Intel Burst)
    const multiplier = abilitySystem?.getDamageMultiplier() ?? 1;
    damage = damage * multiplier;

    if (this.config.reveals && target.config.abilities.includes('stealth') && !target.isRevealed) {
      target.reveal();
    }

    // Beam-type towers: instant line effect instead of projectile
    if (this.config.id === 'firewall' || this.config.id === 'packet_inspector') {
      this.createBeamEffect(target, damage);
      return;
    }

    // IDS: detection ring effect in addition to projectile
    if (this.config.id === 'ids') {
      this.createDetectionRing();
    }

    const upgrade = this.config.upgrades[this.level];
    const options = upgrade.slowFactor
      ? { slowFactor: upgrade.slowFactor, slowDuration: 2000 }
      : undefined;

    const projectile = new Projectile(
      this.scene,
      this.x,
      this.y,
      target,
      damage,
      this.config.id,
      options
    );

    const gameScene = this.scene as unknown as GameSceneInterface;
    gameScene.addProjectile(projectile);
  }

  private createBeamEffect(target: Enemy, damage: number): void {
    const beamColor = this.config.id === 'firewall' ? 0x0076a8 : 0x84bd00;
    const beam = this.scene.add.graphics();
    beam.setDepth(5);

    // Draw beam line
    beam.lineStyle(3, beamColor, 1);
    beam.beginPath();
    beam.moveTo(this.x, this.y);
    beam.lineTo(target.x, target.y);
    beam.strokePath();

    // Inner bright core
    beam.lineStyle(1, 0xffffff, 0.8);
    beam.beginPath();
    beam.moveTo(this.x, this.y);
    beam.lineTo(target.x, target.y);
    beam.strokePath();

    // Apply damage directly
    target.takeDamage(damage, this.config.id);

    // Apply slow if applicable
    const upgrade = this.config.upgrades[this.level];
    if (upgrade.slowFactor) {
      target.applySlow(this.config.id, upgrade.slowFactor, 2000);
    }

    // Fade beam out
    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => beam.destroy(),
    });

    // Impact flash at target
    const flash = this.scene.add.circle(target.x, target.y, 6, beamColor, 0.8);
    flash.setDepth(5);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.5,
      duration: 200,
      onComplete: () => flash.destroy(),
    });
  }

  private createDetectionRing(): void {
    const ring = this.scene.add.circle(this.x, this.y, 10, 0x753bbd, 0);
    ring.setStrokeStyle(2, 0xb388ff, 0.7);
    ring.setDepth(3);

    this.scene.tweens.add({
      targets: ring,
      radius: this.getRange() * 0.5,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        ring.setStrokeStyle(2, 0xb388ff, ring.alpha * 0.7);
      },
      onComplete: () => ring.destroy(),
    });
  }
}
