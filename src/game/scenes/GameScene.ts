export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'Game' }); }
  create(): void {
    this.scene.launch('UI');
    // Core game loop will be built here
  }
  update(_time: number, _delta: number): void {
    // Game tick
  }
}
