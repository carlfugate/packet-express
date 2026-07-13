export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }
  create(): void {
    this.add.text(640, 300, 'PACKET EXPRESS', { fontSize: '48px', color: '#0076A8', fontFamily: 'Arial' }).setOrigin(0.5);
    this.add.text(640, 380, 'Click to Start', { fontSize: '24px', color: '#84BD00', fontFamily: 'Arial' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('Game'));
  }
}
