import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { TOWERS } from '../data/towers';
import { calculateFinalScore, calculateAccuracy } from '../logic/scoring';

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

  // Kill feed
  private killFeedItems: Phaser.GameObjects.Text[] = [];
  private readonly maxKillFeedItems = 5;

  // Speed controls
  private speedButtons: Phaser.GameObjects.Text[] = [];
  private currentSpeed: number = 1;

  // Pause indicator
  private pauseOverlay: Phaser.GameObjects.Container | null = null;

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

    // === EVENT LISTENERS from GameScene ===
    this.gameScene.events.on('threat-killed', this.onThreatKilled, this);
    this.gameScene.events.on('false-positive', this.onFalsePositive, this);
    this.gameScene.events.on('legit-delivered', this.onLegitDelivered, this);
    this.gameScene.events.on('threat-leaked', this.onThreatLeaked, this);
    this.gameScene.events.on('ui-wave-complete', this.onWaveComplete, this);
    this.gameScene.events.on('wave-start', this.onWaveStart, this);
    this.gameScene.events.on('game-over', this.onGameOver, this);
    this.gameScene.events.on('pause-toggled', this.onPauseToggled, this);

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

  private onGameOver(data: { victory: boolean; scoreState: any }): void {
    const scoreState = data.scoreState;
    const accuracy = calculateAccuracy(scoreState.threatsKilled, scoreState.falsePositives);
    const finalScore = calculateFinalScore(scoreState);
    const baseScore = scoreState.score;

    let multiplierLabel: string;
    if (accuracy >= 1.0) multiplierLabel = '1.5x';
    else if (accuracy >= 0.9) multiplierLabel = '1.2x';
    else if (accuracy >= 0.7) multiplierLabel = '1.0x';
    else if (accuracy >= 0.5) multiplierLabel = '0.7x';
    else multiplierLabel = '0.5x';

    const titleText = data.victory ? 'NETWORK SECURED' : 'NETWORK BREACHED';
    const titleColor = data.victory ? '#84BD00' : '#D9534F';

    // Dark overlay
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);

    // Title
    this.add
      .text(640, 140, titleText, { fontSize: '52px', color: titleColor, fontFamily: 'Arial', fontStyle: 'bold' })
      .setOrigin(0.5);

    // Score calculation breakdown
    this.add
      .text(640, 210, `${baseScore} x ${multiplierLabel} = ${finalScore}`, {
        fontSize: '28px', color: '#E7D747', fontFamily: 'Arial', fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(640, 240, 'Base Score x Accuracy Multiplier = Final Score', {
        fontSize: '14px', color: '#B6B7B9', fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Accuracy bar
    const barX = 480;
    const barY = 280;
    const barW = 320;
    const barH = 20;
    // Background
    this.add.rectangle(barX + barW / 2, barY + barH / 2, barW, barH, 0x333333, 1).setOrigin(0.5);
    // Fill (colored by accuracy)
    const accColor = accuracy >= 0.9 ? 0x5ea500 : accuracy >= 0.7 ? 0xe7d747 : 0xd9534f;
    const fillW = barW * accuracy;
    this.add.rectangle(barX + fillW / 2, barY + barH / 2, fillW, barH, accColor, 1).setOrigin(0.5);
    this.add
      .text(640, barY + barH + 8, `Accuracy: ${Math.round(accuracy * 100)}%`, {
        fontSize: '16px', color: '#FFFFFF', fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // Stats
    const statsY = 340;
    this.add
      .text(640, statsY, `Threats Killed: ${scoreState.threatsKilled}`, { fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial' })
      .setOrigin(0.5);
    this.add
      .text(640, statsY + 30, `False Positives: ${scoreState.falsePositives}`, {
        fontSize: '18px',
        color: scoreState.falsePositives > 0 ? '#D9534F' : '#5EA500',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
    this.add
      .text(640, statsY + 60, `Threats Leaked: ${scoreState.threatsLeaked}`, { fontSize: '18px', color: '#F47F28', fontFamily: 'Arial' })
      .setOrigin(0.5);
    this.add
      .text(640, statsY + 90, `Legitimate Delivered: ${scoreState.legitimateDelivered}`, { fontSize: '18px', color: '#5EA500', fontFamily: 'Arial' })
      .setOrigin(0.5);
    this.add
      .text(640, statsY + 120, `Waves Completed: ${scoreState.currentWave}/20`, { fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial' })
      .setOrigin(0.5);

    // Play Again button (large and obvious)
    const btnY = 560;
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
      this.scene.start('Game');
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
}
