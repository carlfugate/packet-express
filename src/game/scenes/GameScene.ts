import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { WaveManager } from '../systems/WaveManager';
import { BuildSystem } from '../systems/BuildSystem';
import { MapRenderer } from '../systems/MapRenderer';
import { MAP_DATA } from '../data/maps';
import { TOWERS } from '../data/towers';
import { GAME_CONFIG } from '../config';
import { ScoreState } from '../types';
import {
  calculateKillScore,
  applyFalsePositivePenalty,
  calculateAccuracy,
  calculateLegitDeliveryBonus,
  calculateWaveBonus,
} from '../logic/scoring';
import { calculateWaveClearBonus } from '../logic/economy';

export class GameScene extends Phaser.Scene {
  // State
  private credits: number = GAME_CONFIG.startingMoney;
  private bandwidth: number = GAME_CONFIG.lives;
  private scoreState!: ScoreState;

  // Entity collections
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private projectiles: Projectile[] = [];

  // Systems
  private waveManager!: WaveManager;
  private buildSystem!: BuildSystem;
  private mapRenderer!: MapRenderer;

  // Game state
  private gameOver: boolean = false;
  private paused: boolean = false;
  private gameSpeed: number = 1;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    // Reset state for replays
    this.credits = GAME_CONFIG.startingMoney;
    this.bandwidth = GAME_CONFIG.lives;
    this.gameOver = false;
    this.paused = false;
    this.gameSpeed = 1;
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];

    // Initialize score state
    this.scoreState = {
      score: 0,
      threatsKilled: 0,
      threatsLeaked: 0,
      falsePositives: 0,
      legitimateDelivered: 0,
      accuracy: 1.0,
      currentWave: 0,
    };

    // Initialize systems
    this.mapRenderer = new MapRenderer(this);
    this.mapRenderer.drawTrack(MAP_DATA.waypoints);
    this.mapRenderer.drawTowerSlots(MAP_DATA.towerSlots);

    this.waveManager = new WaveManager(this);
    this.buildSystem = new BuildSystem(this);

    // Launch UI scene on top
    this.scene.launch('UI', { gameScene: this });

    // Wire events from WaveManager
    this.events.on('spawn-enemy', this.handleSpawnEnemy, this);
    this.events.on('wave-complete', this.handleWaveComplete, this);
    this.events.on('tower-placed', this.handleTowerPlaced, this);

    // Input: click tower slots to place towers
    this.input.on('pointerdown', this.handlePointerDown, this);

    // Keyboard shortcuts
    this.input.keyboard?.on('keydown-SPACE', () => this.waveManager.startWave());
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-H', () => this.openHelp());
    this.input.keyboard?.on('keydown-ONE', () => this.setGameSpeed(1));
    this.input.keyboard?.on('keydown-TWO', () => this.setGameSpeed(2));
    this.input.keyboard?.on('keydown-THREE', () => this.setGameSpeed(3));

    // Expose for E2E testing
    (window as unknown as Record<string, unknown>).__GAME_STATE__ = this.getGameState();

    // Start first wave after brief delay
    this.time.delayedCall(2000, () => this.waveManager.startWave());
  }

  update(time: number, delta: number): void {
    if (this.gameOver || this.paused) return;

    const adjustedDelta = delta * this.gameSpeed;

    // Update all entities
    this.enemies.forEach((e) => e.update(time, adjustedDelta));
    this.towers.forEach((t) => t.update(time, adjustedDelta));
    this.projectiles.forEach((p) => p.update(time, adjustedDelta));

    // Clean up destroyed entities
    this.enemies = this.enemies.filter((e) => e.isAlive);
    this.projectiles = this.projectiles.filter((p) => p.active);

    // Update exposed game state for E2E
    (window as unknown as Record<string, unknown>).__GAME_STATE__ = this.getGameState();
  }

  // --- Public accessors for GameSceneInterface ---
  getEnemies(): Enemy[] {
    return this.enemies;
  }

  addProjectile(projectile: Projectile): void {
    this.projectiles.push(projectile);
  }

  getCredits(): number {
    return this.credits;
  }

  getBandwidth(): number {
    return this.bandwidth;
  }

  getScoreState(): ScoreState {
    return this.scoreState;
  }

  getGameState(): object {
    return {
      credits: this.credits,
      bandwidth: this.bandwidth,
      score: this.scoreState.score,
      wave: this.waveManager?.getCurrentWave() ?? 0,
      towersPlaced: this.towers.length,
      enemiesAlive: this.enemies.length,
      accuracy: this.scoreState.accuracy,
      threatsKilled: this.scoreState.threatsKilled,
      falsePositives: this.scoreState.falsePositives,
      gameOver: this.gameOver,
    };
  }

  // --- Event handlers ---
  private handleSpawnEnemy(data: { type: string; config: typeof TOWERS extends (infer T)[] ? T : never; wave: number } & Record<string, unknown>): void {
    const enemy = new Enemy(this, data.config as any, this.waveManager.getCurrentWave(), MAP_DATA.waypoints);
    this.enemies.push(enemy);

    // Listen for enemy events on the instance
    enemy.on('enemy-killed', (config: any) => this.handleEnemyKilled(config));
    enemy.on('enemy-reached-end', () => this.handleEnemyReachedEnd(enemy.config));
  }

  private handleEnemyKilled(config: any): void {
    if (config.type === 'legitimate') {
      // FALSE POSITIVE
      this.scoreState.falsePositives++;
      this.scoreState.score = applyFalsePositivePenalty(this.scoreState.score, config.id);
      this.scoreState.accuracy = calculateAccuracy(this.scoreState.threatsKilled, this.scoreState.falsePositives);
      this.events.emit('false-positive', config);
    } else {
      // Legitimate kill
      this.scoreState.threatsKilled++;
      const killScore = calculateKillScore(config.id, this.waveManager.getCurrentWave());
      this.scoreState.score += killScore;
      this.credits += config.reward;
      this.scoreState.accuracy = calculateAccuracy(this.scoreState.threatsKilled, this.scoreState.falsePositives);
      this.events.emit('threat-killed', { config, score: killScore });
    }
    this.waveManager.onEnemyDefeated();
  }

  private handleEnemyReachedEnd(config: any): void {
    if (config.type === 'legitimate') {
      // Legitimate traffic delivered successfully
      this.scoreState.legitimateDelivered++;
      const bonus = calculateLegitDeliveryBonus(config.id);
      this.scoreState.score += bonus;
      this.events.emit('legit-delivered', { config, bonus });
    } else {
      // OT damage: use otDamage if defined, otherwise default to 1
      const damage = config.otDamage || 1;
      this.bandwidth -= damage;
      this.scoreState.threatsLeaked++;
      this.events.emit('threat-leaked', { config, damage });
      if (this.bandwidth <= 0) {
        this.endGame(false);
      }
    }
    this.waveManager.onEnemyReachedEnd();
  }

  private handleWaveComplete(): void {
    const waveNum = this.waveManager.getCurrentWave();
    const clearBonus = calculateWaveClearBonus(waveNum);
    const waveScoreBonus = calculateWaveBonus(waveNum);
    this.credits += clearBonus;
    this.scoreState.score += waveScoreBonus;
    this.scoreState.currentWave = waveNum;
    this.events.emit('ui-wave-complete', { wave: waveNum, creditBonus: clearBonus, scoreBonus: waveScoreBonus });

    if (this.waveManager.isLastWave()) {
      this.endGame(true);
    } else {
      // Auto-start next wave after delay
      this.time.delayedCall(5000, () => {
        if (!this.gameOver) this.waveManager.startWave();
      });
    }
  }

  private handleTowerPlaced(data: { slotId: string; towerId: string; config: any; level: number }): void {
    this.credits -= data.config.cost;
    const slot = MAP_DATA.towerSlots.find((s) => s.id === data.slotId);
    if (!slot) return;
    const tower = new Tower(this, slot.x, slot.y, data.config, data.slotId);
    this.towers.push(tower);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    // Check if clicking on an existing tower first
    const clickedTower = this.towers.find((t) => {
      const dx = Math.abs(pointer.worldX - t.x);
      const dy = Math.abs(pointer.worldY - t.y);
      return dx < 24 && dy < 24;
    });

    if (clickedTower) {
      const slotInfo = this.buildSystem.getSlotInfo(clickedTower.slotId);
      if (slotInfo) {
        const config = this.buildSystem.getTowerConfig(slotInfo.towerId);
        if (config) {
          this.events.emit('placed-tower-selected', {
            tower: clickedTower,
            slotId: clickedTower.slotId,
            config,
            level: slotInfo.level,
            x: clickedTower.x,
            y: clickedTower.y,
          });
          return;
        }
      }
    }

    const slot = MAP_DATA.towerSlots.find((s) => {
      const dx = Math.abs(pointer.worldX - s.x);
      const dy = Math.abs(pointer.worldY - s.y);
      return dx < 24 && dy < 24;
    });

    if (slot) {
      this.events.emit('slot-clicked', slot);
      // Try to place selected tower
      if (this.buildSystem.canPlaceAt(slot.id, this.credits)) {
        this.buildSystem.placeAt(slot.id);
      }
    } else {
      // Clicking elsewhere dismisses the tower action panel
      this.events.emit('placed-tower-deselected');
    }
  }

  private togglePause(): void {
    this.paused = !this.paused;
    this.events.emit('pause-toggled', this.paused);
  }

  sellTower(slotId: string): void {
    const result = this.buildSystem.sell(slotId);
    if (result) {
      this.credits += result.refund;
      // Remove the tower entity
      const towerIndex = this.towers.findIndex((t) => t.slotId === slotId);
      if (towerIndex >= 0) {
        const tower = this.towers[towerIndex];
        tower.destroy();
        this.towers.splice(towerIndex, 1);
      }
    }
  }

  upgradeTower(slotId: string): void {
    const result = this.buildSystem.upgrade(slotId);
    if (result) {
      this.credits -= result.cost;
      // Upgrade the tower entity
      const tower = this.towers.find((t) => t.slotId === slotId);
      if (tower) {
        tower.upgrade();
      }
    }
  }

  private openHelp(): void {
    const wasPaused = this.paused;
    if (!wasPaused) {
      this.pauseForHelp();
    }
    this.scene.launch('Help', { returnTo: 'Game', gamePaused: wasPaused });
  }

  pauseForHelp(): void {
    this.paused = true;
    this.events.emit('pause-toggled', true);
  }

  resumeFromHelp(): void {
    this.paused = false;
    this.events.emit('pause-toggled', false);
  }

  setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
  }

  private endGame(victory: boolean): void {
    this.gameOver = true;
    this.events.emit('game-over', { victory, scoreState: this.scoreState });
  }

  shutdown(): void {
    this.events.off('spawn-enemy');
    this.events.off('wave-complete');
    this.events.off('tower-placed');
  }
}
