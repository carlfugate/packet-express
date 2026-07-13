import Phaser from 'phaser';
import { Enemy } from './Enemy';

const PROJECTILE_SPEED = 400;
const HIT_DISTANCE = 10;

export class Projectile extends Phaser.GameObjects.Image {
  private target: Enemy | null;
  private damage: number;
  private speed: number = PROJECTILE_SPEED;
  private towerId: string;
  private slowFactor?: number;
  private slowDuration?: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    damage: number,
    towerId: string,
    options?: { slowFactor?: number; slowDuration?: number }
  ) {
    super(scene, x, y, `projectile_${towerId}`);

    this.target = target;
    this.damage = damage;
    this.towerId = towerId;
    this.slowFactor = options?.slowFactor;
    this.slowDuration = options?.slowDuration;

    scene.add.existing(this);
  }

  update(time: number, delta: number): void {
    if (!this.target || !this.target.isAlive) {
      this.destroy();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < HIT_DISTANCE) {
      this.target.takeDamage(this.damage);
      if (this.slowFactor !== undefined && this.slowDuration !== undefined) {
        this.target.applySlow(this.towerId, this.slowFactor, this.slowDuration);
      }
      this.destroy();
      return;
    }

    const moveDistance = (this.speed * delta) / 1000;
    const angle = Math.atan2(dy, dx);
    this.x += Math.cos(angle) * moveDistance;
    this.y += Math.sin(angle) * moveDistance;
    this.setRotation(angle);
  }
}
