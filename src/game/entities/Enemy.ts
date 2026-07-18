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
  public lastHitBy: string = '';

  private healthBar: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Image;
  private label: Phaser.GameObjects.Text;
  private waypoints: Array<{ x: number; y: number }>;
  private currentWaypointIndex: number = 0;
  private slowEffects: Map<string, { factor: number; expires: number }> = new Map();
  private totalPathLength: number;

  constructor(
    scene: Phaser.Scene,
    config: EnemyConfig,
    waveNumber: number,
    waypoints: Array<{ x: number; y: number }>,
    healthOverride?: number,
    speedOverride?: number
  ) {
    const spawn = waypoints[0];
    super(scene, spawn.x, spawn.y);

    this.config = config;
    this.waypoints = waypoints;
    this.maxHealth = healthOverride ?? getScaledHealth(config.health, waveNumber);
    this.currentHealth = this.maxHealth;
    this.baseSpeed = speedOverride ?? config.speed;
    this.speed = this.baseSpeed;
    this.isLegitimate = config.type === 'legitimate';

    this.sprite = scene.add.image(0, 0, `enemy_${config.id}`);
    this.add(this.sprite);

    // Add type abbreviation label below sprite
    const labelText = this.getLabelText();
    this.label = scene.add.text(0, 14, labelText, {
      fontSize: '8px',
      color: this.isLegitimate ? '#84BD00' : '#D9534F',
      fontFamily: 'monospace',
    }).setOrigin(0.5).setAlpha(0.7);
    this.add(this.label);

    // Hide label for stealth enemies until revealed
    if (config.abilities.includes('stealth')) {
      this.label.setVisible(false);
    }

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

    // === Movement Animations ===

    // Bob animation: gentle float up/down
    const bob = Math.sin(time * 0.003 + this.distanceOnPath) * 2;
    this.sprite.y = bob;

    // DDoS jitter (swarm ability)
    if (this.config.abilities.includes('swarm')) {
      this.sprite.x = (Math.random() - 0.5) * 3;
      this.sprite.y = (Math.random() - 0.5) * 3;
    }

    // Stealth flicker
    if (this.config.abilities.includes('stealth') && !this.isRevealed) {
      this.sprite.alpha = 0.1 + Math.random() * 0.15;
    }

    // Legitimate glow pulse
    if (this.isLegitimate) {
      this.sprite.alpha = 0.8 + Math.sin(time * 0.005) * 0.2;
    }

    if (this.currentWaypointIndex >= this.waypoints.length) {
      this.emit('enemy-reached-end', this);
      this.isAlive = false;
      this.destroy();
    }
  }

  takeDamage(amount: number, sourceId?: string): void {
    if (sourceId) {
      this.lastHitBy = sourceId;
    }
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
    this.label.setVisible(true);
    this.emit('enemy-revealed', this);
  }

  private die(): void {
    this.isAlive = false;

    const deathX = this.x;
    const deathY = this.y;

    if (this.isLegitimate) {
      // False positive: red X mark that fades
      this.createFalsePositiveEffect(deathX, deathY);
    } else {
      // Threat: burst particles
      this.createDeathBurst(deathX, deathY);
    }

    // Scale down + fade over 300ms before destroying
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.emit('enemy-killed', this.config);
        this.destroy();
      },
    });
  }

  private createDeathBurst(x: number, y: number): void {
    // 5 red particles expanding outward and fading
    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const particle = this.scene.add.circle(x, y, 3, 0xd9534f, 1);
      particle.setDepth(10);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 25,
        y: y + Math.sin(angle) * 25,
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private createFalsePositiveEffect(x: number, y: number): void {
    // Large red X mark
    const xMark = this.scene.add.graphics();
    xMark.setDepth(10);
    xMark.lineStyle(4, 0xd9534f, 1);
    xMark.beginPath();
    xMark.moveTo(x - 14, y - 14);
    xMark.lineTo(x + 14, y + 14);
    xMark.strokePath();
    xMark.beginPath();
    xMark.moveTo(x + 14, y - 14);
    xMark.lineTo(x - 14, y + 14);
    xMark.strokePath();

    this.scene.tweens.add({
      targets: xMark,
      alpha: 0,
      duration: 800,
      delay: 200,
      onComplete: () => xMark.destroy(),
    });

    // Screen edge flash (red)
    this.scene.cameras.main.flash(150, 200, 50, 50, true);
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

  private getLabelText(): string {
    const labels: Record<string, string> = {
      malware: 'MLW', ddos: 'DDoS', phishing: 'PHI', sql_injection: 'SQLi',
      ransomware_c2: 'RC2', zero_day: '0DAY', modbus_exploit: 'MBUS',
      firmware_worm: 'FWRM', signal_jammer: 'JAM',
      http_request: 'HTTP', dns_query: 'DNS', api_call: 'API', email: 'MAIL',
      plc_heartbeat: 'PLC', scada_telemetry: 'SCDA', track_switch_cmd: 'TSWI',
      train_position: 'TPOS',
    };
    return labels[this.config.id] || this.config.id.substring(0, 4).toUpperCase();
  }
}
