import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
  }

  create(): void {
    this.add
      .text(640, 240, 'PACKET EXPRESS', {
        fontSize: '56px',
        color: '#0076A8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 320, 'Defend the Network', {
        fontSize: '28px',
        color: '#84BD00',
        fontFamily: 'Arial',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 420, 'Block malicious traffic. Don\'t block legitimate packets.', {
        fontSize: '18px',
        color: '#B6B7B9',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);

    this.add
      .text(640, 520, 'TAP TO START', {
        fontSize: '24px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Game'));
  }
}
