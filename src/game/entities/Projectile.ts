import Phaser from 'phaser';
import { Enemy } from './Enemy';

const PROJECTILE_SPEED = 400;
const HIT_DISTANCE = 10;

// Trail positions for fading effect
interface TrailPoint {
  x: number;
  y: number;
  alpha: number;
}

export class Projectile extends Phaser.GameObjects.Image {
  private target: Enemy | null;
  private damage: number;
  private speed: number = PROJECTILE_SPEED;
  private towerId: string;
  private slowFactor?: number;
  private slowDuration?: number;
  private trail: Phaser.GameObjects.Graphics;
  private trailPoints: TrailPoint[] = [];
  private prevX: number;
  private prevY: number;

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
    this.prevX = x;
    this.prevY = y;

    // Scale up projectiles for better visibility
    this.setScale(1.3);

    // Trail graphics
    this.trail = scene.add.graphics();
    this.trail.setDepth(3);

    scene.add.existing(this);
    this.setDepth(4);
  }

  update(time: number, delta: number): void {
    if (!this.target || !this.target.isAlive) {
      this.cleanup();
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < HIT_DISTANCE) {
      this.onHit();
      return;
    }

    // Store previous position for trail
    this.prevX = this.x;
    this.prevY = this.y;

    const moveDistance = (this.speed * delta) / 1000;
    const angle = Math.atan2(dy, dx);
    this.x += Math.cos(angle) * moveDistance;
    this.y += Math.sin(angle) * moveDistance;

    // Rotate to face direction of travel
    this.setRotation(angle);

    // Add trail point
    this.trailPoints.push({ x: this.x, y: this.y, alpha: 1.0 });

    // Fade and trim trail
    this.trailPoints = this.trailPoints
      .map((p) => ({ ...p, alpha: p.alpha - 0.08 }))
      .filter((p) => p.alpha > 0);

    // Draw enhanced trail
    this.drawTrail();
  }

  private drawTrail(): void {
    this.trail.clear();
    const color = this.getTowerColor();

    // Draw fading trail circles
    for (const point of this.trailPoints) {
      const radius = 2 + point.alpha * 3;
      this.trail.fillStyle(color, point.alpha * 0.5);
      this.trail.fillCircle(point.x, point.y, radius);
    }

    // Draw connecting line from prev to current
    if (this.trailPoints.length > 1) {
      this.trail.lineStyle(2, color, 0.4);
      this.trail.beginPath();
      this.trail.moveTo(this.prevX, this.prevY);
      this.trail.lineTo(this.x, this.y);
      this.trail.strokePath();
    }
  }

  private onHit(): void {
    if (this.target && this.target.isAlive) {
      this.target.takeDamage(this.damage, this.towerId);
      if (this.slowFactor !== undefined && this.slowDuration !== undefined) {
        this.target.applySlow(this.towerId, this.slowFactor, this.slowDuration);
      }
    }

    // Hit effect: expanding ring
    this.createHitEffect();
    this.cleanup();
  }

  private createHitEffect(): void {
    const color = this.getTowerColor();

    // Primary expanding ring
    const ring = this.scene.add.circle(this.x, this.y, 4, color, 0);
    ring.setStrokeStyle(2, color, 0.8);
    ring.setDepth(5);

    this.scene.tweens.add({
      targets: ring,
      radius: 20,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        ring.setStrokeStyle(2, color, ring.alpha);
      },
      onComplete: () => ring.destroy(),
    });

    // Secondary flash
    const flash = this.scene.add.circle(this.x, this.y, 8, 0xffffff, 0.6);
    flash.setDepth(5);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 150,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private getTowerColor(): number {
    const colors: Record<string, number> = {
      firewall: 0x0076a8,
      ids: 0x753bbd,
      waf: 0xf47f28,
      honeypot: 0xe7d747,
      rate_limiter: 0x0093b2,
      packet_inspector: 0x84bd00,
      data_diode: 0x4caf50,
      network_segmentation: 0xe7d747,
    };
    return colors[this.towerId] ?? 0xffffff;
  }

  private cleanup(): void {
    this.trail.destroy();
    this.destroy();
  }
}
