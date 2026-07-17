import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { TOWERS } from '../data/towers';
import { calculateFinalScore, calculateAccuracy } from '../logic/scoring';
import { ModifierCardUI } from '../ui/ModifierCardUI';
import { getRandomModifiers } from '../data/modifiers';

const TOWER_COLORS: Record<string, number> = {
  firewall: 0x0076a8,
  ids: 0x753bbd,
  waf: 0xf47f28,
  honeypot: 0xe7d747,
  rate_limiter: 0x0093b2,
  packet_inspector: 0x84bd00,
};

export class UIScene extends Phaser.Scene {
  private gameScene!: Phaser.Scene;

  // HUD elements
  private creditsText!: Phaser.GameObjects.Text;
  private bandwidthText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private accuracyText!: Phaser.GameObjects.Text;

  // Tower selection panel
  private towerButtons: Phaser.GameObjects.Container[] = [];
  private selectedTowerId: string | null = null;
  private tooltip: Phaser.GameObjects.Container | null = null;

  // Tower action panel (for placed towers)
  private towerActionPanel: Phaser.GameObjects.Container | null = null;
  private selectedPlacedTower: any | null = null;

  // Kill feed
  private killFeedItems: Phaser.GameObjects.Text[] = [];
  private readonly maxKillFeedItems = 5;

  // Speed controls
  private speedButtons: Phaser.GameObjects.Text[] = [];
  private currentSpeed: number = 1;

  // Pause indicator
  private pauseOverlay: Phaser.GameObjects.Container | null = null;

  // Ability buttons
  private abilityButtons: Phaser.GameObjects.Container[] = [];
  private abilityCooldownTexts: Phaser.GameObjects.Text[] = [];
  private abilityTargetingIndicator: Phaser.GameObjects.Text | null = null;

  // Modifier card UI
  private modifierCardUI: ModifierCardUI | null = null;

  constructor() {
    super({ key: 'UI' });
  }

  init(data: { gameScene: Phaser.Scene }): void {
    this.gameScene = data.gameScene;
  }

  create(): void {
    // Reset state
    this.killFeedItems = [];
    this.towerButtons = [];
    this.speedButtons = [];
    this.tooltip = null;
    this.pauseOverlay = null;
    this.currentSpeed = 1;
    this.selectedTowerId = null;
    this.towerActionPanel = null;
    this.selectedPlacedTower = null;
    this.abilityButtons = [];
    this.abilityCooldownTexts = [];
    this.abilityTargetingIndicator = null;
    this.modifierCardUI = null;

    // === TOP BAR (HUD) ===
    const barBg = this.add.rectangle(640, 20, 1280, 40, 0x044872, 0.9);
    barBg.setOrigin(0.5, 0.5);

    this.creditsText = this.add.text(20, 10, `Credits: ${GAME_CONFIG.startingMoney}`, {
      fontSize: '18px',
      color: '#84BD00',
      fontFamily: 'Arial',
    });
    this.bandwidthText = this.add.text(200, 10, `Bandwidth: ${GAME_CONFIG.lives}`, {
      fontSize: '18px',
      color: '#0093B2',
      fontFamily: 'Arial',
    });
    this.waveText = this.add.text(420, 10, 'Wave: 0/20', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
    });
    this.scoreText = this.add.text(620, 10, 'Score: 0', {
      fontSize: '18px',
      color: '#E7D747',
      fontFamily: 'Arial',
    });
    this.accuracyText = this.add.text(820, 10, 'Accuracy: 100%', {
      fontSize: '18px',
      color: '#5EA500',
      fontFamily: 'Arial',
    });

    // === SPEED CONTROLS (top-right) ===
    this.createSpeedControls();

    // === TOWER SELECTION BAR (bottom) ===
    this.createTowerBar();

    // === ABILITY BUTTONS (right side, below speed controls) ===
    this.createAbilityButtons();

    // === EVENT LISTENERS from GameScene ===
    this.gameScene.events.on('threat-killed', this.onThreatKilled, this);
    this.gameScene.events.on('false-positive', this.onFalsePositive, this);
    this.gameScene.events.on('legit-delivered', this.onLegitDelivered, this);
    this.gameScene.events.on('threat-leaked', this.onThreatLeaked, this);
    this.gameScene.events.on('ui-wave-complete', this.onWaveComplete, this);
    this.gameScene.events.on('wave-start', this.onWaveStart, this);
    this.gameScene.events.on('game-over', this.onGameOver, this);
    this.gameScene.events.on('pause-toggled', this.onPauseToggled, this);
    this.gameScene.events.on('placed-tower-selected', this.onPlacedTowerSelected, this);
    this.gameScene.events.on('placed-tower-deselected', this.onPlacedTowerDeselected, this);
    this.gameScene.events.on('ability-targeting', this.onAbilityTargeting, this);
    this.gameScene.events.on('ability-targeting-cancelled', this.onAbilityTargetingCancelled, this);
    this.gameScene.events.on('show-modifiers', this.onShowModifiers, this);

    // Cleanup on shutdown
    this.events.on('shutdown', () => {
      this.gameScene.events.off('threat-killed', this.onThreatKilled, this);
      this.gameScene.events.off('false-positive', this.onFalsePositive, this);
      this.gameScene.events.off('legit-delivered', this.onLegitDelivered, this);
      this.gameScene.events.off('threat-leaked', this.onThreatLeaked, this);
      this.gameScene.events.off('ui-wave-complete', this.onWaveComplete, this);
      this.gameScene.events.off('wave-start', this.onWaveStart, this);
      this.gameScene.events.off('game-over', this.onGameOver, this);
      this.gameScene.events.off('pause-toggled', this.onPauseToggled, this);
      this.gameScene.events.off('placed-tower-selected', this.onPlacedTowerSelected, this);
      this.gameScene.events.off('placed-tower-deselected', this.onPlacedTowerDeselected, this);
      this.gameScene.events.off('ability-targeting', this.onAbilityTargeting, this);
      this.gameScene.events.off('ability-targeting-cancelled', this.onAbilityTargetingCancelled, this);
      this.gameScene.events.off('show-modifiers', this.onShowModifiers, this);
    });
  }

  update(): void {
    // Refresh HUD values from GameScene state
    const state = (this.gameScene as any).getGameState() as Record<string, any>;
    this.creditsText.setText(`Credits: ${state.credits}`);
    this.bandwidthText.setText(`Bandwidth: ${state.bandwidth}`);
    this.waveText.setText(`Wave: ${state.wave}/20`);
    this.scoreText.setText(`Score: ${state.score}`);

    const accuracyPct = Math.round(state.accuracy * 100);
    this.accuracyText.setText(`Accuracy: ${accuracyPct}%`);
    this.accuracyText.setColor(accuracyPct >= 90 ? '#5EA500' : accuracyPct >= 70 ? '#E7D747' : '#D9534F');

    // Update ability cooldown displays
    this.updateAbilityCooldowns();
  }

  private createSpeedControls(): void {
    const speeds = [1, 2, 3];
    const startX = 1100;
    const y = 10;

    // Help button (? icon)
    const helpBtn = this.add.text(startX - 90, y, '?', {
      fontSize: '20px',
      color: '#0093B2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      backgroundColor: '#0a1628',
      padding: { left: 6, right: 6, top: 1, bottom: 1 },
    }).setInteractive({ useHandCursor: true });
    helpBtn.on('pointerdown', () => this.openHelp());
    helpBtn.on('pointerover', () => helpBtn.setColor('#FFFFFF'));
    helpBtn.on('pointerout', () => helpBtn.setColor('#0093B2'));

    const label = this.add.text(startX - 50, y, 'Speed:', {
      fontSize: '14px',
      color: '#B6B7B9',
      fontFamily: 'Arial',
    });

    speeds.forEach((speed, index) => {
      const x = startX + index * 40;
      const btn = this.add.text(x, y, `${speed}x`, {
        fontSize: '16px',
        color: speed === 1 ? '#84BD00' : '#B6B7B9',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.currentSpeed = speed;
        (this.gameScene as any).setGameSpeed(speed);
        // Update button colors
        this.speedButtons.forEach((b, i) => {
          b.setColor(speeds[i] === speed ? '#84BD00' : '#B6B7B9');
        });
      });

      this.speedButtons.push(btn);
    });
  }

  private openHelp(): void {
    // Pause the game and show help
    const gameScene = this.gameScene as any;
    const wasPaused = gameScene.paused ?? false;
    if (!wasPaused) {
      gameScene.pauseForHelp();
    }
    this.scene.launch('Help', { returnTo: 'Game', gamePaused: wasPaused });
  }

  private createTowerBar(): void {
    const barY = 692;
    const startX = 120;
    const spacing = 180;

    // Solid opaque background bar — sits below the playable area
    const barBg = this.add.rectangle(640, barY, 1280, 56, 0x0a1628, 1);
    barBg.setOrigin(0.5, 0.5);
    // Top border to visually separate from game area
    const barBorder = this.add.rectangle(640, barY - 28, 1280, 2, 0x044872, 1);
    barBorder.setOrigin(0.5, 0.5);

    TOWERS.forEach((config, index) => {
      const x = startX + index * spacing;
      const container = this.add.container(x, barY);

      // Background panel
      const bg = this.add.rectangle(0, 0, 160, 44, 0x044872, 0.9);
      bg.setStrokeStyle(2, 0x0093b2);
      bg.setInteractive({ useHandCursor: true });

      // Colored icon square
      const iconColor = TOWER_COLORS[config.id] ?? 0xffffff;
      const icon = this.add.rectangle(-58, 0, 14, 14, iconColor, 1);
      icon.setStrokeStyle(1, 0xffffff, 0.3);

      // Tower name
      const nameText = this.add
        .text(-38, -10, config.name, { fontSize: '12px', color: '#FFFFFF', fontFamily: 'Arial' })
        .setOrigin(0, 0.5);
      // Cost
      const costText = this.add
        .text(-38, 8, `${config.cost}c`, { fontSize: '11px', color: '#84BD00', fontFamily: 'Arial' })
        .setOrigin(0, 0.5);

      container.add([bg, icon, nameText, costText]);

      // Hover: show tooltip
      bg.on('pointerover', () => {
        this.showTooltip(config, x, barY - 60);
      });
      bg.on('pointerout', () => {
        this.hideTooltip();
      });

      // Click handler: select tower type in BuildSystem
      bg.on('pointerdown', () => {
        this.selectedTowerId = config.id;
        this.gameScene.events.emit('tower-selected', config.id);
        const buildSystem = (this.gameScene as any).buildSystem;
        if (buildSystem) {
          buildSystem.selectTowerType(config.id);
        }
        // Highlight selected
        this.towerButtons.forEach((btn) => {
          const btnBg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
          btnBg.setStrokeStyle(2, 0x0093b2);
        });
        bg.setStrokeStyle(3, 0xf47f28);
      });

      this.towerButtons.push(container);
    });
  }

  private showTooltip(config: typeof TOWERS[number], x: number, y: number): void {
    this.hideTooltip();

    const container = this.add.container(x, y);
    const upgrade = config.upgrades[0];

    const lines = [
      config.name,
      config.description,
      `Damage: ${upgrade.damage} | Range: ${upgrade.range}`,
      `Fire Rate: ${upgrade.fireRate}ms`,
      config.canHitLegitimate ? 'Warning: Can hit legitimate traffic!' : 'Safe: Won\'t target legitimate traffic',
    ];

    const maxWidth = 220;
    const padding = 8;
    const lineHeight = 14;
    const textHeight = lines.length * lineHeight + padding * 2;

    const bg = this.add.rectangle(0, 0, maxWidth + padding * 2, textHeight, 0x0a1628, 0.95);
    bg.setStrokeStyle(1, 0x0093b2);
    bg.setOrigin(0.5, 1);
    container.add(bg);

    lines.forEach((line, i) => {
      const color = i === 0 ? '#FFFFFF' : i === lines.length - 1 ? (config.canHitLegitimate ? '#D9534F' : '#5EA500') : '#B6B7B9';
      const style = i === 0 ? 'bold' : 'normal';
      const text = this.add.text(-maxWidth / 2, -textHeight + padding + i * lineHeight, line, {
        fontSize: '11px',
        color,
        fontFamily: 'Arial',
        fontStyle: style,
        wordWrap: { width: maxWidth },
      });
      container.add(text);
    });

    this.tooltip = container;
  }

  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
    }
  }

  // --- Event handlers ---
  private onThreatKilled(data: { config: any; score: number }): void {
    this.addKillFeedEntry(`+${data.score} ${data.config.name}`, '#84BD00');
  }

  private onFalsePositive(config: any): void {
    this.addKillFeedEntry(`FALSE POSITIVE: ${config.name} -${config.falsePositivePenalty || 200}`, '#D9534F');
    this.cameras.main.flash(200, 200, 50, 50, true);
  }

  private onLegitDelivered(data: { config: any; bonus: number }): void {
    this.addKillFeedEntry(`Delivered: ${data.config.name} +${data.bonus}`, '#5EA500');
  }

  private onThreatLeaked(_config: any): void {
    this.addKillFeedEntry('BREACH! -1 Bandwidth', '#F47F28');
    this.cameras.main.shake(200, 0.005);
  }

  private addKillFeedEntry(text: string, color: string): void {
    const feedX = 1080;
    const baseY = 60;

    // Shift existing items down
    this.killFeedItems.forEach((item) => {
      item.y += 22;
    });

    // Remove items beyond limit
    while (this.killFeedItems.length >= this.maxKillFeedItems) {
      const oldest = this.killFeedItems.pop();
      if (oldest) {
        this.tweens.add({
          targets: oldest,
          alpha: 0,
          duration: 300,
          onComplete: () => oldest.destroy(),
        });
      }
    }

    // Add new entry at top
    const entry = this.add.text(feedX, baseY, text, {
      fontSize: '13px',
      color,
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setAlpha(0);

    this.tweens.add({
      targets: entry,
      alpha: 1,
      duration: 200,
    });

    // Auto-fade after 4 seconds
    this.time.delayedCall(4000, () => {
      if (entry.active) {
        this.tweens.add({
          targets: entry,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            const idx = this.killFeedItems.indexOf(entry);
            if (idx >= 0) this.killFeedItems.splice(idx, 1);
            entry.destroy();
          },
        });
      }
    });

    this.killFeedItems.unshift(entry);
  }

  private onWaveStart(data: { wave: number }): void {
    // Get wave preview from WaveManager
    const waveManager = (this.gameScene as any).waveManager;
    const preview = waveManager?.getWavePreview ? waveManager.getWavePreview() : '';

    // Large wave announcement
    const banner = this.add.container(640, 320);

    const title = this.add
      .text(0, 0, `WAVE ${data.wave}`, {
        fontSize: '56px',
        color: '#0076A8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    banner.add(title);

    // Preview text showing incoming enemies
    if (preview) {
      const previewText = this.add
        .text(0, 40, preview, {
          fontSize: '16px',
          color: '#B6B7B9',
          fontFamily: 'Arial',
        })
        .setOrigin(0.5);
      banner.add(previewText);
    }

    banner.setAlpha(0);
    banner.setScale(0.8);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
      hold: 1500,
      yoyo: true,
      onComplete: () => banner.destroy(),
    });
  }

  private onWaveComplete(data: { wave: number; creditBonus: number; scoreBonus: number }): void {
    this.addKillFeedEntry(`Wave ${data.wave} Clear! +${data.creditBonus}c +${data.scoreBonus}pts`, '#0093B2');
  }

  private createAbilityButtons(): void {
    const gameScene = this.gameScene as any;
    const abilitySystem = gameScene.getAbilitySystem();
    if (!abilitySystem) return;

    const abilities = abilitySystem.getAbilities();
    const startX = 1220;
    const startY = 50;
    const spacing = 50;

    abilities.forEach((ability: any, index: number) => {
      const y = startY + index * spacing;
      const container = this.add.container(startX, y);

      // Button background
      const bg = this.add.rectangle(0, 0, 48, 40, 0x0a1628, 0.9);
      bg.setStrokeStyle(2, parseInt(ability.icon.replace('#', '0x'), 16));
      bg.setInteractive({ useHandCursor: true });

      // Ability short name
      const label = this.add.text(0, -6, ability.shortName, {
        fontSize: '14px',
        color: ability.icon,
        fontFamily: 'Arial',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Cooldown text (hidden when ready)
      const cdText = this.add.text(0, 10, '', {
        fontSize: '10px',
        color: '#B6B7B9',
        fontFamily: 'Arial',
      }).setOrigin(0.5);

      container.add([bg, label, cdText]);

      // Click handler
      bg.on('pointerdown', () => {
        gameScene.useAbility(ability.id);
      });

      bg.on('pointerover', () => {
        // Show tooltip
        this.showAbilityTooltip(ability, startX - 160, y);
      });

      bg.on('pointerout', () => {
        this.hideTooltip();
      });

      this.abilityButtons.push(container);
      this.abilityCooldownTexts.push(cdText);
    });
  }

  private showAbilityTooltip(ability: any, x: number, y: number): void {
    this.hideTooltip();
    const container = this.add.container(x, y);

    const lines = [
      ability.name,
      ability.description,
      `Cooldown: ${ability.cooldown / 1000}s`,
    ];

    const maxWidth = 180;
    const padding = 8;
    const lineHeight = 14;
    const textHeight = lines.length * lineHeight + padding * 2;

    const bg = this.add.rectangle(0, 0, maxWidth + padding * 2, textHeight, 0x0a1628, 0.95);
    bg.setStrokeStyle(1, 0x0093b2);
    bg.setOrigin(0.5, 0.5);
    container.add(bg);

    lines.forEach((line, i) => {
      const color = i === 0 ? '#FFFFFF' : '#B6B7B9';
      const style = i === 0 ? 'bold' : 'normal';
      const text = this.add.text(-maxWidth / 2, -textHeight / 2 + padding + i * lineHeight, line, {
        fontSize: '11px',
        color,
        fontFamily: 'Arial',
        fontStyle: style,
        wordWrap: { width: maxWidth },
      });
      container.add(text);
    });

    this.tooltip = container;
  }

  private updateAbilityCooldowns(): void {
    const gameScene = this.gameScene as any;
    const abilitySystem = gameScene.getAbilitySystem?.();
    if (!abilitySystem) return;

    const abilities = abilitySystem.getAbilities();
    abilities.forEach((ability: any, index: number) => {
      if (index >= this.abilityButtons.length) return;

      const container = this.abilityButtons[index];
      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      const label = container.getAt(1) as Phaser.GameObjects.Text;
      const cdText = this.abilityCooldownTexts[index];

      const ready = abilitySystem.isReady(ability.id);
      const remaining = abilitySystem.getCooldownRemaining(ability.id);

      if (ready) {
        bg.setFillStyle(0x0a1628, 0.9);
        bg.setStrokeStyle(2, parseInt(ability.icon.replace('#', '0x'), 16));
        label.setAlpha(1);
        cdText.setText('');
      } else {
        bg.setFillStyle(0x1a1a1a, 0.9);
        bg.setStrokeStyle(2, 0x484848);
        label.setAlpha(0.4);
        cdText.setText(`${remaining}s`);
      }
    });
  }

  private onAbilityTargeting(_abilityId: string): void {
    // Show targeting mode indicator
    if (!this.abilityTargetingIndicator) {
      this.abilityTargetingIndicator = this.add.text(640, 50, 'Click map to target Emergency Patch', {
        fontSize: '16px',
        color: '#0076A8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        backgroundColor: '#0a1628',
        padding: { left: 12, right: 12, top: 4, bottom: 4 },
      }).setOrigin(0.5);
    }
  }

  private onAbilityTargetingCancelled(): void {
    if (this.abilityTargetingIndicator) {
      this.abilityTargetingIndicator.destroy();
      this.abilityTargetingIndicator = null;
    }
  }

  private onShowModifiers(): void {
    const modifiers = getRandomModifiers(3);
    this.modifierCardUI = new ModifierCardUI(this, modifiers, (selected) => {
      this.modifierCardUI = null;
      if (selected) {
        this.gameScene.events.emit('modifier-selected', selected);
      } else {
        this.gameScene.events.emit('modifier-skipped');
      }
    });
  }

  private onGameOver(data: {
    victory: boolean;
    scoreState: any;
    towerStats?: Record<string, { kills: number; falsePositives: number }>;
    upgradesUsed?: number;
    otDamageOccurred?: boolean;
    abilitiesUsed?: number;
    towersPlaced?: string[];
    difficulty?: { name: string };
  }): void {
    const scoreState = data.scoreState;
    const accuracy = calculateAccuracy(scoreState.threatsKilled, scoreState.falsePositives);
    const finalScore = calculateFinalScore(scoreState);
    const baseScore = scoreState.score;
    const towerStats = data.towerStats ?? {};
    const towersPlaced = data.towersPlaced ?? [];
    const difficultyName = data.difficulty?.name ?? 'Engineer';

    let multiplierLabel: string;
    if (accuracy >= 1.0) multiplierLabel = '1.5x';
    else if (accuracy >= 0.9) multiplierLabel = '1.2x';
    else if (accuracy >= 0.7) multiplierLabel = '1.0x';
    else if (accuracy >= 0.5) multiplierLabel = '0.7x';
    else multiplierLabel = '0.5x';

    const statusText = data.victory ? `NETWORK SECURED (${difficultyName})` : `NETWORK BREACHED (${difficultyName})`;
    const statusColor = data.victory ? '#5EA500' : '#D9534F';

    // Fully opaque overlay — hides all game elements behind the report
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x0a1628, 1);
    overlay.setDepth(9000);

    // === INCIDENT REPORT HEADER ===
    this.add.text(640, 40, 'INCIDENT REPORT', {
      fontSize: '28px', color: '#0076A8', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(640, 70, `Status: ${statusText}`, {
      fontSize: '18px', color: statusColor, fontFamily: 'Courier New, monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Separator
    this.add.rectangle(640, 90, 500, 1, 0x0093b2, 0.6);

    // === SCORE SECTION ===
    const scoreY = 110;
    this.add.text(640, scoreY, `SCORE: ${finalScore.toLocaleString()}  (${baseScore.toLocaleString()} x ${multiplierLabel})`, {
      fontSize: '16px', color: '#E7D747', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Accuracy bar
    const accPct = Math.round(accuracy * 100);
    const barFull = 20;
    const barFilled = Math.round(barFull * accuracy);
    const barStr = '\u2588'.repeat(barFilled) + '\u2591'.repeat(barFull - barFilled);
    const accColor = accPct >= 90 ? '#5EA500' : accPct >= 70 ? '#E7D747' : '#D9534F';
    this.add.text(640, scoreY + 24, `Accuracy: ${accPct}%  ${barStr}`, {
      fontSize: '13px', color: accColor, fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5);

    this.add.text(640, scoreY + 44, `Waves Completed: ${scoreState.currentWave}/20`, {
      fontSize: '13px', color: '#FFFFFF', fontFamily: 'Courier New, monospace',
    }).setOrigin(0.5);

    // Separator
    this.add.rectangle(640, scoreY + 62, 500, 1, 0x0093b2, 0.4);

    // === THREAT SUMMARY ===
    const threatY = scoreY + 78;
    this.add.text(640, threatY, 'THREAT SUMMARY', {
      fontSize: '14px', color: '#0093B2', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    const threatLines = [
      { text: `Threats Neutralized: ${scoreState.threatsKilled}`, color: '#5EA500' },
      { text: `Threats Leaked: ${scoreState.threatsLeaked}`, color: scoreState.threatsLeaked > 0 ? '#F47F28' : '#5EA500' },
      { text: `False Positives: ${scoreState.falsePositives}`, color: scoreState.falsePositives > 0 ? '#D9534F' : '#5EA500' },
      { text: `Legitimate Delivered: ${scoreState.legitimateDelivered}`, color: '#5EA500' },
    ];

    threatLines.forEach((line, i) => {
      this.add.text(640, threatY + 20 + i * 18, line.text, {
        fontSize: '12px', color: line.color, fontFamily: 'Courier New, monospace',
      }).setOrigin(0.5);
    });

    // Separator
    const defenseY = threatY + 20 + threatLines.length * 18 + 10;
    this.add.rectangle(640, defenseY, 500, 1, 0x0093b2, 0.4);

    // === DEFENSE ANALYSIS ===
    const analysisY = defenseY + 16;
    this.add.text(640, analysisY, 'DEFENSE ANALYSIS', {
      fontSize: '14px', color: '#0093B2', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Find best and worst tower
    const towerEntries = Object.entries(towerStats);
    let bestTower = '';
    let bestKills = 0;
    let bestFP = 0;
    let worstTower = '';
    let worstFP = 0;

    for (const [id, stats] of towerEntries) {
      if (stats.kills > bestKills || (stats.kills === bestKills && stats.falsePositives < bestFP)) {
        bestTower = id;
        bestKills = stats.kills;
        bestFP = stats.falsePositives;
      }
      if (stats.falsePositives > worstFP) {
        worstTower = id;
        worstFP = stats.falsePositives;
      }
    }

    const towerNames: Record<string, string> = {
      firewall: 'Firewall', ids: 'IDS', waf: 'WAF', honeypot: 'Honeypot',
      rate_limiter: 'Rate Limiter', packet_inspector: 'Packet Inspector',
      data_diode: 'Data Diode', network_segmentation: 'Segmentation',
    };

    let analysisLineY = analysisY + 20;
    if (bestTower) {
      this.add.text(640, analysisLineY, `Best: ${towerNames[bestTower] ?? bestTower} (${bestKills} kills, ${bestFP} FP)`, {
        fontSize: '12px', color: '#84BD00', fontFamily: 'Courier New, monospace',
      }).setOrigin(0.5);
      analysisLineY += 18;
    }
    if (worstTower && worstFP > 0) {
      this.add.text(640, analysisLineY, `Worst: ${towerNames[worstTower] ?? worstTower} (${worstFP} FPs)`, {
        fontSize: '12px', color: '#F47F28', fontFamily: 'Courier New, monospace',
      }).setOrigin(0.5);
      analysisLineY += 18;
    }
    if (!bestTower && !worstTower) {
      this.add.text(640, analysisLineY, 'No tower data recorded', {
        fontSize: '12px', color: '#7A7B7C', fontFamily: 'Courier New, monospace',
      }).setOrigin(0.5);
      analysisLineY += 18;
    }

    // Separator
    this.add.rectangle(640, analysisLineY + 6, 500, 1, 0x0093b2, 0.4);

    // === RECOMMENDATIONS ===
    const recY = analysisLineY + 22;
    this.add.text(640, recY, 'RECOMMENDATIONS', {
      fontSize: '14px', color: '#0093B2', fontFamily: 'Courier New, monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    const recommendations = this.generateRecommendations(
      scoreState, towerStats, towersPlaced,
      data.upgradesUsed ?? 0, data.otDamageOccurred ?? false, accuracy
    );

    recommendations.forEach((rec, i) => {
      this.add.text(640, recY + 20 + i * 16, rec, {
        fontSize: '11px', color: '#B6B7B9', fontFamily: 'Courier New, monospace',
      }).setOrigin(0.5);
    });

    // === PLAY AGAIN BUTTON ===
    const btnY = Math.min(recY + 20 + recommendations.length * 16 + 40, 640);
    const btnBg = this.add.rectangle(640, btnY, 240, 60, 0x0076a8, 1);
    btnBg.setStrokeStyle(3, 0x48cae4);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add
      .text(640, btnY, 'PLAY AGAIN', { fontSize: '28px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold' })
      .setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x0093b2);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x0076a8);
    });
    btnBg.on('pointerdown', () => {
      this.scene.stop('UI');
      this.scene.stop('Game');
      this.scene.start('Menu');
    });

    // Pulsing animation on button
    this.tweens.add({
      targets: [btnBg, btnText],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private generateRecommendations(
    scoreState: any,
    towerStats: Record<string, { kills: number; falsePositives: number }>,
    towersPlaced: string[],
    upgradesUsed: number,
    otDamageOccurred: boolean,
    accuracy: number
  ): string[] {
    const recs: string[] = [];

    // Find highest FP tower
    let highestFPTower = '';
    let highestFPCount = 0;
    for (const [id, stats] of Object.entries(towerStats)) {
      if (stats.falsePositives > highestFPCount) {
        highestFPTower = id;
        highestFPCount = stats.falsePositives;
      }
    }

    const towerNames: Record<string, string> = {
      firewall: 'Firewall', ids: 'IDS', waf: 'WAF', honeypot: 'Honeypot',
      rate_limiter: 'Rate Limiter', packet_inspector: 'Packet Inspector',
      data_diode: 'Data Diode', network_segmentation: 'Segmentation',
    };

    const fpTowers = ['rate_limiter', 'waf', 'ids'];
    const hasFPTower = towersPlaced.some((t) => fpTowers.includes(t));

    if (scoreState.falsePositives > 10 && hasFPTower && highestFPTower) {
      recs.push(`Replace ${towerNames[highestFPTower] ?? highestFPTower}s with Firewalls in high-traffic lanes`);
    }

    if (scoreState.threatsLeaked > 0 && !towersPlaced.includes('packet_inspector')) {
      recs.push('Add Packet Inspector to reveal stealth threats');
    }

    if (otDamageOccurred) {
      recs.push('Deploy Data Diode at IT/OT boundary to protect critical infrastructure');
    }

    if (accuracy > 0.95 && recs.length < 3) {
      recs.push('Excellent precision. Consider more aggressive towers for faster clears.');
    }

    if (upgradesUsed === 0 && recs.length < 3) {
      recs.push('Upgrade towers for increased effectiveness in later waves');
    }

    // Fallback if no specific recommendations
    if (recs.length === 0) {
      recs.push('Solid defense. Keep refining tower placement for maximum coverage.');
    }

    return recs.slice(0, 4); // Max 4 recs to fit on screen
  }

  private onPauseToggled(paused: boolean): void {
    if (paused) {
      this.pauseOverlay = this.add.container(640, 360);
      const bg = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.5);
      const text = this.add
        .text(0, 0, 'PAUSED', { fontSize: '64px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold' })
        .setOrigin(0.5);
      const subtext = this.add
        .text(0, 50, 'Press ESC to resume', { fontSize: '18px', color: '#B6B7B9', fontFamily: 'Arial' })
        .setOrigin(0.5);
      this.pauseOverlay.add([bg, text, subtext]);
    } else {
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = null;
      }
    }
  }

  private onPlacedTowerSelected(data: {
    tower: any;
    slotId: string;
    config: any;
    level: number;
    x: number;
    y: number;
  }): void {
    this.dismissTowerActionPanel();
    this.selectedPlacedTower = data;

    // Show range circle on the tower
    data.tower.showRange();

    // Position panel near tower but offset so it doesn't cover it
    const panelX = data.x + 60 > 1180 ? data.x - 160 : data.x + 60;
    const panelY = data.y - 60 < 0 ? data.y + 20 : data.y - 60;

    this.towerActionPanel = this.add.container(panelX, panelY);

    // Panel background
    const panelBg = this.add.rectangle(100, 60, 200, 120, 0x044872, 0.95);
    panelBg.setStrokeStyle(2, 0x0093b2);
    panelBg.setOrigin(0.5, 0.5);

    // Title: tower name + level
    const title = this.add.text(100, 18, `${data.config.name} Lv.${data.level}`, {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    // Upgrade button
    const gameState = (this.gameScene as any).getGameState() as Record<string, any>;
    const credits = gameState.credits;
    const buildSystem = (this.gameScene as any).buildSystem;
    const canUpgrade = buildSystem.canUpgrade(data.slotId, credits);
    const isMaxLevel = data.level >= data.config.upgrades.length;

    let upgradeCostText = 'MAX';
    if (!isMaxLevel) {
      const upgradeCost = Math.round(data.config.cost * [1, 1.5, 2.5][data.level]);
      upgradeCostText = `${upgradeCost}c`;
    }

    const upgBg = this.add.rectangle(100, 50, 180, 28, 0x0a1628, 0.9);
    upgBg.setStrokeStyle(1, canUpgrade ? 0x84bd00 : 0x484848);
    upgBg.setOrigin(0.5, 0.5);
    if (canUpgrade) {
      upgBg.setInteractive({ useHandCursor: true });
    }

    const upgText = this.add.text(100, 50, `Upgrade ${upgradeCostText}`, {
      fontSize: '12px',
      color: canUpgrade ? '#84BD00' : '#7A7B7C',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    if (canUpgrade) {
      upgBg.on('pointerdown', () => {
        (this.gameScene as any).upgradeTower(data.slotId);
        this.dismissTowerActionPanel();
      });
      upgBg.on('pointerover', () => upgBg.setFillStyle(0x1a2a3a));
      upgBg.on('pointerout', () => upgBg.setFillStyle(0x0a1628));
    }

    // Sell button
    const sellPrice = data.tower.getSellPrice();
    const sellBg = this.add.rectangle(100, 84, 180, 28, 0x0a1628, 0.9);
    sellBg.setStrokeStyle(1, 0xf47f28);
    sellBg.setOrigin(0.5, 0.5);
    sellBg.setInteractive({ useHandCursor: true });

    const sellText = this.add.text(100, 84, `Sell +${sellPrice}c`, {
      fontSize: '12px',
      color: '#F47F28',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);

    sellBg.on('pointerdown', () => {
      (this.gameScene as any).sellTower(data.slotId);
      this.dismissTowerActionPanel();
    });
    sellBg.on('pointerover', () => sellBg.setFillStyle(0x1a2a3a));
    sellBg.on('pointerout', () => sellBg.setFillStyle(0x0a1628));

    this.towerActionPanel.add([panelBg, title, upgBg, upgText, sellBg, sellText]);
  }

  private onPlacedTowerDeselected(): void {
    this.dismissTowerActionPanel();
  }

  private dismissTowerActionPanel(): void {
    if (this.selectedPlacedTower) {
      this.selectedPlacedTower.tower.hideRange();
      this.selectedPlacedTower = null;
    }
    if (this.towerActionPanel) {
      this.towerActionPanel.destroy();
      this.towerActionPanel = null;
    }
  }
}
