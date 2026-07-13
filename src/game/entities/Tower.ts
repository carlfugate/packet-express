import Phaser from 'phaser';
import { TowerConfig } from '../types';
import { calculateDamage, isInRange, selectTarget, calculateBonusDamage } from '../logic/combat';
import { calculateSellPrice } from '../logic/economy';
import { GAME_CONFIG } from '../config';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';

interface GameSceneInterface {
  getEnemies(): Enemy[];
  addProjectile(projectile: Projectile): void;
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
      this.config.canHitLegitimate
    );

    if (targetIndex === null) return;

    const aliveEnemies = enemies.filter((e) => e.isAlive);
    const target = aliveEnemies[targetIndex];
    if (!target) return;

    this.fireAt(target);
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
    this.rangeCircle.fillStyle(0x0076a8, 0.15);
    this.rangeCircle.fillCircle(0, 0, this.getRange());
    this.rangeCircle.setVisible(true);
    this.showingRange = true;
  }

  hideRange(): void {
    this.rangeCircle.setVisible(false);
    this.showingRange = false;
  }

  private fireAt(target: Enemy): void {
    this.emit('tower-fired', this, target);

    let damage = this.getDamage();
    damage = calculateBonusDamage(damage, target.config.id, this.config.bonusVs);

    if (this.config.reveals && target.config.abilities.includes('stealth') && !target.isRevealed) {
      target.reveal();
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
}
