import { WAVES } from '../data/waves';
import { ENEMIES } from '../data/enemies';
import type { Wave, WaveEntry, EnemyConfig } from '../types';
import { getScaledHealth, calculateSpawnDelay, getWaveEnemyCount } from '../logic/waves';
import type { DifficultyConfig } from '../config';
import { DIFFICULTIES } from '../config';
import type { ModifierContext } from '../data/modifiers';
import { createDefaultModifierContext } from '../data/modifiers';

export class WaveManager {
  private scene: Phaser.Scene;
  private difficulty: DifficultyConfig;
  private currentWave: number = 0;
  private spawning: boolean = false;
  private spawnQueue: Array<{ type: string; delay: number }> = [];
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private enemiesAlive: number = 0;
  private enemiesSpawned: number = 0;
  private totalEnemiesInWave: number = 0;
  private enemyConfigMap: Record<string, EnemyConfig>;
  private modifierContext: ModifierContext = createDefaultModifierContext();

  constructor(scene: Phaser.Scene, difficulty?: DifficultyConfig) {
    this.scene = scene;
    this.difficulty = difficulty ?? DIFFICULTIES[1];
    this.enemyConfigMap = {};
    for (const enemy of ENEMIES) {
      this.enemyConfigMap[enemy.id] = enemy;
    }
  }

  setModifierContext(context: ModifierContext): void {
    this.modifierContext = context;
  }

  getModifierContext(): ModifierContext {
    return this.modifierContext;
  }

  startWave(): void {
    if (this.spawning) return;
    if (this.currentWave >= WAVES.length) return;

    this.currentWave++;
    const wave = WAVES[this.currentWave - 1];
    this.totalEnemiesInWave = this.getAdjustedEnemyCount(wave);
    this.enemiesSpawned = 0;
    this.enemiesAlive = 0;
    this.spawning = true;

    this.buildSpawnQueue(wave);
    this.scene.events.emit('wave-start', { wave: this.currentWave });
    this.spawnNext();
  }

  private getAdjustedEnemyCount(wave: Wave): number {
    return wave.enemies.reduce((sum, entry) => {
      const config = this.enemyConfigMap[entry.type];
      const isLegit = config?.type === 'legitimate';
      const modMult = isLegit ? this.modifierContext.legitTrafficMult : this.modifierContext.enemyCountMult;
      return sum + Math.ceil(entry.count * this.difficulty.enemyCountMultiplier * modMult);
    }, 0);
  }

  private buildSpawnQueue(wave: Wave): void {
    this.spawnQueue = [];

    // Build per-type queues with delays
    const typeQueues: Array<{ type: string; delay: number }>[] = [];
    for (const entry of wave.enemies) {
      const queue: Array<{ type: string; delay: number }> = [];
      const delay = calculateSpawnDelay(entry, wave.wave);
      const config = this.enemyConfigMap[entry.type];
      const isLegit = config?.type === 'legitimate';
      const modMult = isLegit ? this.modifierContext.legitTrafficMult : this.modifierContext.enemyCountMult;
      const adjustedCount = Math.ceil(entry.count * this.difficulty.enemyCountMultiplier * modMult);
      for (let i = 0; i < adjustedCount; i++) {
        queue.push({ type: entry.type, delay });
      }
      typeQueues.push(queue);
    }

    // Interleave: round-robin through type queues
    let hasMore = true;
    while (hasMore) {
      hasMore = false;
      for (const queue of typeQueues) {
        if (queue.length > 0) {
          this.spawnQueue.push(queue.shift()!);
          hasMore = hasMore || queue.length > 0;
        }
      }
    }
  }

  private spawnNext(): void {
    if (this.spawnQueue.length === 0) {
      this.spawning = false;
      return;
    }

    const item = this.spawnQueue.shift()!;
    const config = this.enemyConfigMap[item.type];
    if (!config) {
      this.spawnNext();
      return;
    }

    const scaledHealth = Math.round(getScaledHealth(config.health, this.currentWave) * this.difficulty.healthMultiplier * this.modifierContext.enemyHealthMult);
    const adjustedSpeed = Math.round(config.speed * this.difficulty.speedMultiplier * this.modifierContext.enemySpeedMult);
    this.enemiesSpawned++;
    this.enemiesAlive++;

    this.scene.events.emit('spawn-enemy', {
      type: item.type,
      config,
      health: scaledHealth,
      speed: adjustedSpeed,
      wave: this.currentWave,
    });

    if (this.spawnQueue.length > 0) {
      const nextDelay = this.spawnQueue[0].delay;
      this.spawnTimer = this.scene.time.delayedCall(nextDelay, () => {
        this.spawnNext();
      });
    } else {
      this.spawning = false;
    }
  }

  onEnemyDefeated(): void {
    this.enemiesAlive--;
    this.checkWaveComplete();
  }

  onEnemyReachedEnd(): void {
    this.enemiesAlive--;
    this.checkWaveComplete();
  }

  private checkWaveComplete(): void {
    if (this.enemiesAlive <= 0 && !this.spawning) {
      this.scene.events.emit('wave-complete', {
        wave: this.currentWave,
        bonus: WAVES[this.currentWave - 1]?.bonus ?? 0,
      });
    }
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  isLastWave(): boolean {
    return this.currentWave >= WAVES.length;
  }

  isSpawning(): boolean {
    return this.spawning;
  }

  getProgress(): { spawned: number; total: number; alive: number } {
    return {
      spawned: this.enemiesSpawned,
      total: this.totalEnemiesInWave,
      alive: this.enemiesAlive,
    };
  }

  getWavePreview(): string {
    const nextIndex = this.currentWave; // 0-based for next wave
    if (nextIndex >= WAVES.length) return 'No more waves';

    const wave = WAVES[nextIndex];
    const parts: string[] = [];
    for (const entry of wave.enemies) {
      const config = this.enemyConfigMap[entry.type];
      const name = config ? config.name : entry.type;
      const adjustedCount = Math.ceil(entry.count * this.difficulty.enemyCountMultiplier);
      parts.push(`${adjustedCount}x ${name}`);
    }
    return `Wave ${wave.wave}: ${parts.join(', ')}`;
  }

  destroy(): void {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
  }
}
