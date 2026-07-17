import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Tower } from '../entities/Tower';
import { Projectile } from '../entities/Projectile';
import { WaveManager } from '../systems/WaveManager';
import { BuildSystem } from '../systems/BuildSystem';
import { MapRenderer } from '../systems/MapRenderer';
import { AbilitySystem } from '../systems/AbilitySystem';
import { MAP_DATA } from '../data/maps';
import { TOWERS } from '../data/towers';
import { GAME_CONFIG, DifficultyConfig, DIFFICULTIES } from '../config';
import { ScoreState } from '../types';
import {
  calculateKillScore,
  calculateAccuracy,
  calculateLegitDeliveryBonus,
  calculateWaveBonus,
} from '../logic/scoring';
import { calculateWaveClearBonus } from '../logic/economy';
import type { WaveModifier, ModifierContext } from '../data/modifiers';
import { createDefaultModifierContext } from '../data/modifiers';

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
  private abilitySystem!: AbilitySystem;

  // Game state
  private gameOver: boolean = false;
  private paused: boolean = false;
  private gameSpeed: number = 1;

  // Tower stats tracking (per tower type)
  private towerStats: Map<string, { kills: number; falsePositives: number }> = new Map();
  private upgradesUsed: number = 0;
  private otDamageOccurred: boolean = false;
  private abilitiesUsed: number = 0;

  // Difficulty
  private difficulty: DifficultyConfig = DIFFICULTIES[1];

  // Modifier state
  private activeModifier: WaveModifier | null = null;
  private modifierContext: ModifierContext = createDefaultModifierContext();

  constructor() {
    super({ key: 'Game' });
  }

  init(data: { difficulty?: DifficultyConfig }): void {
    if (data?.difficulty) {
      this.difficulty = data.difficulty;
    } else {
      this.difficulty = DIFFICULTIES[1]; // default normal
    }
  }

  create(): void {
    // Reset state for replays
    this.credits = this.difficulty.startingCredits;
    this.bandwidth = this.difficulty.startingBandwidth;
    this.gameOver = false;
    this.paused = false;
    this.gameSpeed = 1;
    this.enemies = [];
    this.towers = [];
    this.projectiles = [];
    this.towerStats = new Map();
    this.upgradesUsed = 0;
    this.otDamageOccurred = false;
    this.abilitiesUsed = 0;

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

    this.waveManager = new WaveManager(this, this.difficulty);
    this.buildSystem = new BuildSystem(this);
    this.abilitySystem = new AbilitySystem(this);

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
      abilitiesUsed: this.abilitiesUsed,
      towerStats: Object.fromEntries(this.towerStats),
    };
  }

  // --- Event handlers ---
  private handleSpawnEnemy(data: { type: string; config: typeof TOWERS extends (infer T)[] ? T : never; wave: number; health?: number; speed?: number } & Record<string, unknown>): void {
    const enemy = new Enemy(this, data.config as any, this.waveManager.getCurrentWave(), MAP_DATA.waypoints, data.health, data.speed);
    this.enemies.push(enemy);

    // Listen for enemy events on the instance
    enemy.on('enemy-killed', (config: any) => this.handleEnemyKilled(config, enemy.lastHitBy));
    enemy.on('enemy-reached-end', () => this.handleEnemyReachedEnd(enemy.config));
  }

  private handleEnemyKilled(config: any, lastHitBy?: string): void {
    if (config.type === 'legitimate') {
      // FALSE POSITIVE
      this.scoreState.falsePositives++;
      const basePenalty = config.falsePositivePenalty || 200;
      const adjustedPenalty = Math.round(basePenalty * this.difficulty.falsePositivePenaltyMultiplier * this.modifierContext.falsePositivePenaltyMult);
      this.scoreState.score = Math.max(0, this.scoreState.score - adjustedPenalty);
      this.scoreState.accuracy = calculateAccuracy(this.scoreState.threatsKilled, this.scoreState.falsePositives);
      // Track tower false positive
      if (lastHitBy) {
        const stats = this.towerStats.get(lastHitBy) ?? { kills: 0, falsePositives: 0 };
        stats.falsePositives++;
        this.towerStats.set(lastHitBy, stats);
      }
      this.events.emit('false-positive', config);
    } else {
      // Legitimate kill
      this.scoreState.threatsKilled++;
      const killScore = Math.round(calculateKillScore(config.id, this.waveManager.getCurrentWave()) * this.modifierContext.scoreMultiplier);
      this.scoreState.score += killScore;
      const creditReward = Math.round(config.reward * this.modifierContext.creditMultiplier);
      this.credits += creditReward;
      this.scoreState.accuracy = calculateAccuracy(this.scoreState.threatsKilled, this.scoreState.falsePositives);
      // Track tower kill
      if (lastHitBy) {
        const stats = this.towerStats.get(lastHitBy) ?? { kills: 0, falsePositives: 0 };
        stats.kills++;
        this.towerStats.set(lastHitBy, stats);
      }
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
      if (damage > 1) {
        this.otDamageOccurred = true;
      }
      this.events.emit('threat-leaked', { config, damage });
      if (this.bandwidth <= 0) {
        this.endGame(false);
      }
    }
    this.waveManager.onEnemyReachedEnd();
  }

  private handleWaveComplete(): void {
    const waveNum = this.waveManager.getCurrentWave();
    const clearBonus = Math.round(calculateWaveClearBonus(waveNum) * this.modifierContext.creditMultiplier);
    const waveScoreBonus = Math.round(calculateWaveBonus(waveNum) * this.modifierContext.scoreMultiplier);
    this.credits += clearBonus;
    this.scoreState.score += waveScoreBonus;
    this.scoreState.currentWave = waveNum;

    // Apply overflow bonus (+50 credits) if active
    if (this.activeModifier?.id === 'overflow') {
      this.credits += 50;
    }

    // Revert active modifier after wave
    if (this.activeModifier) {
      this.activeModifier.revert(this.modifierContext);
      this.activeModifier = null;
      this.waveManager.setModifierContext(createDefaultModifierContext());
    }

    this.events.emit('ui-wave-complete', { wave: waveNum, creditBonus: clearBonus, scoreBonus: waveScoreBonus });

    if (this.waveManager.isLastWave()) {
      this.endGame(true);
    } else if (waveNum >= 1) {
      // Show modifier cards starting from wave 2 onwards (after wave 1 completes)
      this.events.emit('show-modifiers', { wave: waveNum });
      // Listen for modifier selection
      this.events.once('modifier-selected', (mod: WaveModifier) => {
        this.applyModifier(mod);
        this.startNextWaveAfterDelay();
      });
      this.events.once('modifier-skipped', () => {
        this.startNextWaveAfterDelay();
      });
    } else {
      this.startNextWaveAfterDelay();
    }
  }

  private applyModifier(mod: WaveModifier): void {
    this.activeModifier = mod;
    this.modifierContext = createDefaultModifierContext();
    mod.apply(this.modifierContext);
    this.waveManager.setModifierContext(this.modifierContext);

    // Handle special one-shot effects
    if (mod.id === 'budget_surplus') {
      this.credits += 100;
    }
    if (mod.id === 'budget_cut') {
      this.credits = Math.max(0, this.credits - 50);
    }
  }

  private startNextWaveAfterDelay(): void {
    this.time.delayedCall(this.difficulty.waveDelay, () => {
      if (!this.gameOver) this.waveManager.startWave();
    });
  }

  private handleTowerPlaced(data: { slotId: string; towerId: string; config: any; level: number }): void {
    this.credits -= data.config.cost;
    const slot = MAP_DATA.towerSlots.find((s) => s.id === data.slotId);
    if (!slot) return;
    const tower = new Tower(this, slot.x, slot.y, data.config, data.slotId);
    this.towers.push(tower);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    // Check if an ability is in targeting mode (Emergency Patch)
    const targetingAbility = this.abilitySystem.getTargetingMode();
    if (targetingAbility) {
      const used = this.abilitySystem.use(targetingAbility, this.enemies, { x: pointer.worldX, y: pointer.worldY });
      if (used) {
        this.abilitiesUsed++;
      }
      this.abilitySystem.setTargetingMode(null);
      this.events.emit('ability-targeting-cancelled');
      return;
    }

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
      this.upgradesUsed++;
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

  getAbilitySystem(): AbilitySystem {
    return this.abilitySystem;
  }

  useAbility(abilityId: string): boolean {
    if (abilityId === 'emergency_patch') {
      // Enter targeting mode — don't fire immediately
      if (!this.abilitySystem.isReady(abilityId)) return false;
      this.abilitySystem.setTargetingMode(abilityId);
      this.events.emit('ability-targeting', abilityId);
      return true;
    }
    // Non-targeted abilities fire immediately
    const used = this.abilitySystem.use(abilityId, this.enemies);
    if (used) {
      this.abilitiesUsed++;
    }
    return used;
  }

  private endGame(victory: boolean): void {
    this.gameOver = true;
    this.events.emit('game-over', {
      victory,
      scoreState: this.scoreState,
      towerStats: Object.fromEntries(this.towerStats),
      upgradesUsed: this.upgradesUsed,
      otDamageOccurred: this.otDamageOccurred,
      abilitiesUsed: this.abilitiesUsed,
      towersPlaced: this.towers.map((t) => t.config.id),
      difficulty: this.difficulty,
    });
  }

  shutdown(): void {
    this.events.off('spawn-enemy');
    this.events.off('wave-complete');
    this.events.off('tower-placed');
  }
}
