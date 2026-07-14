import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private helpClicked: boolean = false;

  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    this.helpClicked = false;

    this.add
      .text(640, 200, 'PACKET EXPRESS', {
        fontSize: '56px',
        color: '#0076A8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 280, 'Defend the Network', {
        fontSize: '28px',
        color: '#84BD00',
        fontFamily: 'Arial',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 340, 'Block malicious traffic. Don\'t block legitimate packets.', {
        fontSize: '18px',
        color: '#B6B7B9',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    // TAP TO START
    this.add
      .text(640, 440, 'TAP TO START', {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // How to Play button
    const helpBtn = this.add
      .text(640, 500, 'HOW TO PLAY', {
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

    // Click anywhere else to start the game (preserves E2E test behavior)
    this.input.on('pointerdown', () => {
      if (!this.helpClicked) {
        this.scene.start('Game');
      }
    });
  }
}
