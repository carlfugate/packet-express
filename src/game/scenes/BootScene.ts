import Phaser from 'phaser';
import { AssetGenerator } from '../systems/AssetGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create(): void {
    // Generate all procedural textures
    AssetGenerator.generate(this);
    // Show brief loading text then transition
    this.scene.start('Menu');
  }
}
