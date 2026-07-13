export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }
  preload(): void { /* Asset generation will go here */ }
  create(): void { this.scene.start('Menu'); }
}
