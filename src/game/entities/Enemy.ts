import Phaser from 'phaser';
import { EnemyConfig } from '../types';
import { getScaledHealth } from '../logic/waves';
import { applySlowFactor } from '../logic/combat';

const HEALTH_BAR_WIDTH = 40;
const HEALTH_BAR_HEIGHT = 5;
const HEALTH_BAR_OFFSET_Y = -25;

export class Enemy extends Phaser.GameObjects.Container {
  public config: EnemyConfig;
  public currentHealth: number;
  public maxHealth: number;
  public speed: number;
  public baseSpeed: number;
  public isLegitimate: boolean;
  public distanceOnPath: number = 0;
  public pathProgress: number = 0;
  public isAlive: boolean = true;
  public isRevealed: boolean = false;

  private healthBar: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Image;
  private waypoints: Array<{ x: number; y: number }>;
  private currentWaypointIndex: number = 0;
  private slowEffects: Map<string, { factor: number; expires: number }> = new Map();
  private totalPathLength: number;

  constructor(
    scene: Phaser.Scene,
    config: EnemyConfig,
    waveNumber: number,
    waypoints: Array<{ x: number; y: number }>
  ) {
    const spawn = waypoints[0];
    super(scene, spawn.x, spawn.y);

    this.config = config;
    this.waypoints = waypoints;
    this.maxHealth = getScaledHealth(config.health, waveNumber);
    this.currentHealth = this.maxHealth;
    this.baseSpeed = config.speed;
    this.speed = config.speed;
    this.isLegitimate = config.type === 'legitimate';

    this.sprite = scene.add.image(0, 0, `enemy_${config.id}`);
    this.add(this.sprite);

    this.healthBar = scene.add.graphics();
    this.add(this.healthBar);
    this.updateHealthBar();

    this.totalPathLength = this.calculateTotalPathLength();

    if (config.abilities.includes('stealth')) {
      this.setAlpha(0.3);
      this.isRevealed = false;
    }

    this.currentWaypointIndex = 1;

    scene.add.existing(this);
  }

  update(time: number, delta: number): void {
    if (!this.isAlive) return;

    // Regen ability: heal 1% of max HP per second
    if (this.config.abilities.includes('regen')) {
      const healAmount = (this.maxHealth * 0.01 * delta) / 1000;
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + healAmount);
      this.updateHealthBar();
    }

    const effectiveSpeed = this.getEffectiveSpeed();
    const moveDistance = (effectiveSpeed * delta) / 1000;

    let remaining = moveDistance;
    while (remaining > 0 && this.currentWaypointIndex < this.waypoints.length) {
      const target = this.waypoints[this.currentWaypointIndex];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= remaining) {
        this.x = target.x;
        this.y = target.y;
        this.distanceOnPath += dist;
        remaining -= dist;
        this.currentWaypointIndex++;
      } else {
        const ratio = remaining / dist;
        this.x += dx * ratio;
        this.y += dy * ratio;
        this.distanceOnPath += remaining;
        remaining = 0;
      }
    }

    this.pathProgress =
      this.totalPathLength > 0 ? this.distanceOnPath / this.totalPathLength : 0;

    if (this.currentWaypointIndex >= this.waypoints.length) {
      this.emit('enemy-reached-end', this);
      this.isAlive = false;
      this.destroy();
    }
  }

  takeDamage(amount: number): void {
    this.currentHealth -= amount;
    this.updateHealthBar();
    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  applySlow(sourceId: string, factor: number, duration: number): void {
    const expires = this.scene.time.now + duration;
    this.slowEffects.set(sourceId, { factor, expires });
  }

  reveal(): void {
    this.setAlpha(1);
    this.isRevealed = true;
    this.emit('enemy-revealed', this);
  }

  private die(): void {
    this.isAlive = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 200,
      onComplete: () => {
        this.emit('enemy-killed', this.config);
        this.destroy();
      },
    });
  }

  private updateHealthBar(): void {
    this.healthBar.clear();
    const ratio = Math.max(0, this.currentHealth / this.maxHealth);

    // Red background
    this.healthBar.fillStyle(0xd9534f, 1);
    this.healthBar.fillRect(
      -HEALTH_BAR_WIDTH / 2,
      HEALTH_BAR_OFFSET_Y,
      HEALTH_BAR_WIDTH,
      HEALTH_BAR_HEIGHT
    );

    // Green fill
    this.healthBar.fillStyle(0x5ea500, 1);
    this.healthBar.fillRect(
      -HEALTH_BAR_WIDTH / 2,
      HEALTH_BAR_OFFSET_Y,
      HEALTH_BAR_WIDTH * ratio,
      HEALTH_BAR_HEIGHT
    );
  }

  private getEffectiveSpeed(): number {
    let strongest = 1.0;
    const now = this.scene.time.now;
    this.slowEffects.forEach((effect, key) => {
      if (effect.expires < now) {
        this.slowEffects.delete(key);
      } else if (effect.factor < strongest) {
        strongest = effect.factor;
      }
    });
    if (strongest < 1.0) {
      return applySlowFactor(this.baseSpeed, strongest);
    }
    return this.baseSpeed;
  }

  private calculateTotalPathLength(): number {
    let total = 0;
    for (let i = 1; i < this.waypoints.length; i++) {
      const dx = this.waypoints[i].x - this.waypoints[i - 1].x;
      const dy = this.waypoints[i].y - this.waypoints[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
  }
}
