import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';

export interface Ability {
  id: string;
  name: string;
  shortName: string;
  description: string;
  cooldown: number; // milliseconds
  icon: string; // color hex for procedural icon
  execute: (scene: Phaser.Scene, enemies: Enemy[], targetPoint?: { x: number; y: number }) => void;
}

export class AbilitySystem {
  private scene: Phaser.Scene;
  private abilities: Ability[];
  private cooldowns: Map<string, number> = new Map(); // id -> ready-at timestamp
  private targetingMode: string | null = null; // ability id currently in targeting mode
  private damageMultiplier: number = 1;
  private damageMultiplierExpires: number = 0;
  private immuneUntil: number = 0; // timestamp when legit immunity expires

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.abilities = this.createAbilities();
  }

  getAbilities(): Ability[] {
    return this.abilities;
  }

  isReady(abilityId: string): boolean {
    const readyAt = this.cooldowns.get(abilityId) ?? 0;
    return this.scene.time.now >= readyAt;
  }

  getCooldownRemaining(abilityId: string): number {
    const readyAt = this.cooldowns.get(abilityId) ?? 0;
    const remaining = readyAt - this.scene.time.now;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }

  use(abilityId: string, enemies: Enemy[], targetPoint?: { x: number; y: number }): boolean {
    if (!this.isReady(abilityId)) return false;

    const ability = this.abilities.find((a) => a.id === abilityId);
    if (!ability) return false;

    ability.execute(this.scene, enemies, targetPoint);
    this.cooldowns.set(abilityId, this.scene.time.now + ability.cooldown);
    return true;
  }

  getTargetingMode(): string | null {
    return this.targetingMode;
  }

  setTargetingMode(abilityId: string | null): void {
    this.targetingMode = abilityId;
  }

  getDamageMultiplier(): number {
    if (this.scene.time.now >= this.damageMultiplierExpires) {
      this.damageMultiplier = 1;
    }
    return this.damageMultiplier;
  }

  isLegitImmune(): boolean {
    return this.scene.time.now < this.immuneUntil;
  }

  private createAbilities(): Ability[] {
    return [
      {
        id: 'emergency_patch',
        name: 'Emergency Patch',
        shortName: 'EP',
        description: 'Kill all threats within 150px radius of target. Does not affect legitimate traffic.',
        cooldown: 60000,
        icon: '#0076A8',
        execute: (scene: Phaser.Scene, enemies: Enemy[], targetPoint?: { x: number; y: number }) => {
          if (!targetPoint) return;

          // Visual: expanding blue circle pulse
          const circle = scene.add.circle(targetPoint.x, targetPoint.y, 10, 0x0076a8, 0.4);
          circle.setStrokeStyle(3, 0x0076a8, 0.8);
          circle.setDepth(10);

          scene.tweens.add({
            targets: circle,
            radius: 150,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeOut',
            onUpdate: () => {
              circle.setStrokeStyle(3, 0x0076a8, circle.alpha);
            },
            onComplete: () => circle.destroy(),
          });

          // Kill all non-legitimate enemies in radius
          const radius = 150;
          enemies.forEach((enemy) => {
            if (!enemy.isAlive || enemy.isLegitimate) return;
            const dx = enemy.x - targetPoint.x;
            const dy = enemy.y - targetPoint.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
              enemy.takeDamage(enemy.currentHealth + 1);
            }
          });
        },
      },
      {
        id: 'traffic_reroute',
        name: 'Traffic Reroute',
        shortName: 'TR',
        description: 'All legitimate traffic becomes immune to tower damage for 8 seconds.',
        cooldown: 45000,
        icon: '#84BD00',
        execute: (scene: Phaser.Scene, enemies: Enemy[]) => {
          // Set immunity flag
          this.immuneUntil = scene.time.now + 8000;

          // Visual: flash screen green briefly
          scene.cameras.main.flash(300, 132, 189, 0, true);

          // Glow effect on all legit enemies
          enemies.forEach((enemy) => {
            if (!enemy.isAlive || !enemy.isLegitimate) return;
            // Add green tint
            enemy.setAlpha(1);
            const shield = scene.add.circle(enemy.x, enemy.y, 18, 0x84bd00, 0.3);
            shield.setStrokeStyle(2, 0x84bd00, 0.8);
            shield.setDepth(9);

            // Follow enemy and fade after 8s
            const followTimer = scene.time.addEvent({
              delay: 50,
              repeat: 159, // 8 seconds at 50ms intervals
              callback: () => {
                if (enemy.isAlive) {
                  shield.setPosition(enemy.x, enemy.y);
                } else {
                  shield.destroy();
                  followTimer.destroy();
                }
              },
            });

            scene.time.delayedCall(8000, () => {
              if (shield.active) shield.destroy();
            });
          });
        },
      },
      {
        id: 'threat_intel',
        name: 'Threat Intel Burst',
        shortName: 'TI',
        description: 'Reveals all stealth enemies. All towers get 2x damage for 5 seconds.',
        cooldown: 90000,
        icon: '#753BBD',
        execute: (scene: Phaser.Scene, enemies: Enemy[]) => {
          // Set damage multiplier
          this.damageMultiplier = 2;
          this.damageMultiplierExpires = scene.time.now + 5000;

          // Screen pulse
          scene.cameras.main.flash(400, 117, 59, 189, true);

          // Reveal all stealth enemies and flash them
          enemies.forEach((enemy) => {
            if (!enemy.isAlive) return;

            if (enemy.config.abilities.includes('stealth') && !enemy.isRevealed) {
              enemy.reveal();
            }

            // Brief flash on all enemies
            scene.tweens.add({
              targets: enemy,
              alpha: 0.2,
              duration: 100,
              yoyo: true,
              repeat: 2,
            });
          });

          // Reset multiplier after 5s
          scene.time.delayedCall(5000, () => {
            this.damageMultiplier = 1;
          });
        },
      },
    ];
  }
}
