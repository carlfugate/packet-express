import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { TOWERS } from '../data/towers';
import { calculateFinalScore } from '../logic/scoring';

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

  // Kill feed position
  private killFeedY: number = 100;

  constructor() {
    super({ key: 'UI' });
  }

  init(data: { gameScene: Phaser.Scene }): void {
    this.gameScene = data.gameScene;
  }

  create(): void {
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

  private createTowerBar(): void {
    const barY = 680;
    const startX = 200;
    const spacing = 150;

    TOWERS.forEach((config, index) => {
      const x = startX + index * spacing;
      const container = this.add.container(x, barY);

      // Background panel
      const bg = this.add.rectangle(0, 0, 130, 50, 0x044872, 0.9);
      bg.setStrokeStyle(2, 0x0093b2);
      bg.setInteractive({ useHandCursor: true });

      // Tower name
      const nameText = this.add
        .text(0, -12, config.name, { fontSize: '12px', color: '#FFFFFF', fontFamily: 'Arial' })
        .setOrigin(0.5);
      // Cost
      const costText = this.add
        .text(0, 8, `${config.cost}c`, { fontSize: '11px', color: '#84BD00', fontFamily: 'Arial' })
        .setOrigin(0.5);

      container.add([bg, nameText, costText]);

      // Click handler: select tower type in BuildSystem
      bg.on('pointerdown', () => {
        this.selectedTowerId = config.id;
        this.gameScene.events.emit('tower-selected', config.id);
        // Tell BuildSystem which tower is selected
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

  // --- Event handlers for floating notifications ---
  private onThreatKilled(data: { config: any; score: number }): void {
    this.showFloatingText(`+${data.score}`, '#84BD00');
  }

  private onFalsePositive(config: any): void {
    this.showFloatingText(`FALSE POSITIVE! -${config.falsePositivePenalty || 200}`, '#D9534F');
    this.cameras.main.flash(200, 200, 50, 50, true);
  }

  private onLegitDelivered(data: { config: any; bonus: number }): void {
    this.showFloatingText(`Delivered +${data.bonus}`, '#5EA500');
  }

  private onThreatLeaked(_config: any): void {
    this.showFloatingText('BREACH! -1 Bandwidth', '#F47F28');
    this.cameras.main.shake(200, 0.005);
  }

  private onWaveStart(data: { wave: number }): void {
    const banner = this.add
      .text(640, 360, `WAVE ${data.wave}`, {
        fontSize: '48px',
        color: '#0076A8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 },
      y: { from: 380, to: 360 },
      duration: 500,
      hold: 1000,
      yoyo: true,
      onComplete: () => banner.destroy(),
    });
  }

  private onWaveComplete(data: { wave: number; creditBonus: number; scoreBonus: number }): void {
    this.showFloatingText(`Wave ${data.wave} Clear! +${data.creditBonus}c +${data.scoreBonus}pts`, '#0093B2');
  }

  private onGameOver(data: { victory: boolean; scoreState: any }): void {
    const finalScore = calculateFinalScore(data.scoreState);
    const titleText = data.victory ? 'NETWORK SECURED' : 'NETWORK BREACHED';
    const titleColor = data.victory ? '#84BD00' : '#D9534F';

    // Dark overlay
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);

    // Results
    this.add
      .text(640, 200, titleText, { fontSize: '48px', color: titleColor, fontFamily: 'Arial', fontStyle: 'bold' })
      .setOrigin(0.5);
    this.add
      .text(640, 280, `Final Score: ${finalScore}`, { fontSize: '32px', color: '#E7D747', fontFamily: 'Arial' })
      .setOrigin(0.5);
    this.add
      .text(640, 330, `Threats Killed: ${data.scoreState.threatsKilled}`, { fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial' })
      .setOrigin(0.5);
    this.add
      .text(640, 360, `False Positives: ${data.scoreState.falsePositives}`, {
        fontSize: '20px',
        color: data.scoreState.falsePositives > 0 ? '#D9534F' : '#5EA500',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
    this.add
      .text(640, 390, `Accuracy: ${Math.round(data.scoreState.accuracy * 100)}%`, { fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial' })
      .setOrigin(0.5);
    this.add
      .text(640, 420, `Waves Completed: ${data.scoreState.currentWave}/20`, { fontSize: '20px', color: '#FFFFFF', fontFamily: 'Arial' })
      .setOrigin(0.5);

    // Play again button
    const btn = this.add
      .text(640, 520, 'PLAY AGAIN', { fontSize: '28px', color: '#0076A8', fontFamily: 'Arial', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      this.scene.stop('UI');
      this.scene.stop('Game');
      this.scene.start('Game');
    });
  }

  private onPauseToggled(paused: boolean): void {
    if (paused) {
      this.add
        .text(640, 360, 'PAUSED', { fontSize: '48px', color: '#FFFFFF', fontFamily: 'Arial' })
        .setOrigin(0.5)
        .setName('pauseText');
    } else {
      const pauseText = this.children.getByName('pauseText');
      if (pauseText) pauseText.destroy();
    }
  }

  private showFloatingText(text: string, color: string): void {
    const floater = this.add.text(1100, this.killFeedY, text, {
      fontSize: '14px',
      color,
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: floater,
      y: floater.y - 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => floater.destroy(),
    });

    this.killFeedY += 20;
    if (this.killFeedY > 400) this.killFeedY = 100;
  }
}
