import Phaser from 'phaser';
import { DIFFICULTIES, DifficultyConfig } from '../config';

export class MenuScene extends Phaser.Scene {
  private helpClicked: boolean = false;
  private selectedDifficulty: DifficultyConfig = DIFFICULTIES[1]; // default: normal
  private gameStarting: boolean = false;

  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    this.helpClicked = false;
    this.gameStarting = false;
    this.selectedDifficulty = DIFFICULTIES[1];

    this.add
      .text(640, 160, 'PACKET EXPRESS', {
        fontSize: '56px',
        color: '#0076A8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 240, 'Defend the Network', {
        fontSize: '28px',
        color: '#84BD00',
        fontFamily: 'Arial',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // Difficulty selection label
    this.add
      .text(640, 300, 'SELECT DIFFICULTY', {
        fontSize: '16px',
        color: '#B6B7B9',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    const buttonWidth = 200;
    const buttonSpacing = 220;
    const startX = 640 - buttonSpacing;
    const buttonY = 370;

    DIFFICULTIES.forEach((diff, index) => {
      const x = startX + index * buttonSpacing;

      const bg = this.add.rectangle(x, buttonY, buttonWidth, 80, 0x044872, 0.9);
      bg.setStrokeStyle(2, diff.id === 'normal' ? 0xf47f28 : 0x0093b2);
      bg.setInteractive({ useHandCursor: true });

      this.add
        .text(x, buttonY - 18, diff.name.toUpperCase(), {
          fontSize: '18px',
          color: '#FFFFFF',
          fontFamily: 'Arial',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);

      this.add
        .text(x, buttonY + 12, diff.description, {
          fontSize: '11px',
          color: '#B6B7B9',
          fontFamily: 'Arial',
          wordWrap: { width: buttonWidth - 20 },
        })
        .setOrigin(0.5);

      // Clicking a difficulty button selects it and starts the game
      bg.on('pointerdown', () => {
        this.selectedDifficulty = diff;
        this.startGame();
      });
      bg.on('pointerover', () => bg.setFillStyle(0x0a1628, 0.9));
      bg.on('pointerout', () => bg.setFillStyle(0x044872, 0.9));
    });

    // TAP TO START
    this.add
      .text(640, 470, 'TAP TO START', {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // How to Play button
    const helpBtn = this.add
      .text(640, 530, 'HOW TO PLAY', {
        fontSize: '20px',
        color: '#0093B2',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    helpBtn.on('pointerdown', () => {
      this.helpClicked = true;
      this.scene.start('Help', { returnTo: 'Menu' });
    });
    helpBtn.on('pointerover', () => helpBtn.setColor('#FFFFFF'));
    helpBtn.on('pointerout', () => helpBtn.setColor('#0093B2'));

    // Credits line
    this.add
      .text(640, 660, 'Built for HoboCon | SecKC', {
        fontSize: '14px',
        color: '#7A7B7C',
        fontFamily: 'Arial',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // Click anywhere else to start the game with default difficulty (preserves E2E test behavior)
    this.input.on('pointerdown', () => {
      if (!this.helpClicked) {
        this.startGame();
      }
    });
  }

  private startGame(): void {
    if (this.gameStarting) return;
    this.gameStarting = true;
    this.scene.start('Game', { difficulty: this.selectedDifficulty });
  }
}
