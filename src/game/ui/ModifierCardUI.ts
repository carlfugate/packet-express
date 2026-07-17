import Phaser from 'phaser';
import type { WaveModifier } from '../data/modifiers';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 280;
const CARD_GAP = 24;
const CARD_BG_COLOR = 0x0a1628;
const CARD_BORDER_COLOR = 0x0093b2;
const AUTO_DISMISS_MS = 10000;

const CATEGORY_COLORS: Record<string, number> = {
  risk: 0xf47f28,
  reward: 0x84bd00,
  chaos: 0x753bbd,
};

const CATEGORY_LABELS: Record<string, string> = {
  risk: 'RISK',
  reward: 'REWARD',
  chaos: 'CHAOS',
};

export class ModifierCardUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private cards: Phaser.GameObjects.Container[] = [];
  private modifiers: WaveModifier[];
  private onSelect: (modifier: WaveModifier | null) => void;
  private autoDismissTimer: Phaser.Time.TimerEvent | null = null;
  private destroyed = false;

  constructor(
    scene: Phaser.Scene,
    modifiers: WaveModifier[],
    onSelect: (modifier: WaveModifier | null) => void,
  ) {
    this.scene = scene;
    this.modifiers = modifiers;
    this.onSelect = onSelect;

    this.container = scene.add.container(640, 360);
    this.container.setDepth(5000);

    // Dimmed backdrop
    const backdrop = scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6);
    backdrop.setInteractive(); // absorbs clicks behind cards
    this.container.add(backdrop);

    // Title
    const title = scene.add.text(0, -220, 'CHOOSE A MODIFIER', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(title);

    // Build cards
    this.buildCards();

    // Skip button
    const skip = scene.add.text(0, 180, 'No modifier', {
      fontSize: '16px',
      color: '#B6B7B9',
      fontFamily: 'Arial',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    skip.on('pointerover', () => skip.setColor('#FFFFFF'));
    skip.on('pointerout', () => skip.setColor('#B6B7B9'));
    skip.on('pointerdown', () => this.selectModifier(null));
    this.container.add(skip);

    // Slide in animation
    this.container.setAlpha(0);
    this.container.y += 50;
    scene.tweens.add({
      targets: this.container,
      alpha: 1,
      y: 360,
      duration: 300,
      ease: 'Back.easeOut',
    });

    // Auto-dismiss timer
    this.autoDismissTimer = scene.time.delayedCall(AUTO_DISMISS_MS, () => {
      if (!this.destroyed) {
        this.selectModifier(null);
      }
    });
  }

  private buildCards(): void {
    const totalWidth = this.modifiers.length * CARD_WIDTH + (this.modifiers.length - 1) * CARD_GAP;
    const startX = -totalWidth / 2 + CARD_WIDTH / 2;

    this.modifiers.forEach((mod, index) => {
      const x = startX + index * (CARD_WIDTH + CARD_GAP);
      const card = this.createCard(mod, x, -20);
      this.cards.push(card);
      this.container.add(card);
    });
  }

  private createCard(mod: WaveModifier, x: number, y: number): Phaser.GameObjects.Container {
    const card = this.scene.add.container(x, y);
    const catColor = CATEGORY_COLORS[mod.category] ?? 0xffffff;

    // Card background
    const bg = this.scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_BG_COLOR, 0.95);
    bg.setStrokeStyle(2, CARD_BORDER_COLOR);
    bg.setInteractive({ useHandCursor: true });
    card.add(bg);

    // Colored accent stripe at top
    const stripe = this.scene.add.rectangle(0, -CARD_HEIGHT / 2 + 4, CARD_WIDTH - 4, 8, catColor, 1);
    card.add(stripe);

    // Category label
    const catLabel = this.scene.add.text(0, -CARD_HEIGHT / 2 + 24, CATEGORY_LABELS[mod.category] ?? '', {
      fontSize: '11px',
      color: `#${catColor.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    card.add(catLabel);

    // Name
    const name = this.scene.add.text(0, -CARD_HEIGHT / 2 + 60, mod.name, {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: CARD_WIDTH - 24 },
    }).setOrigin(0.5);
    card.add(name);

    // Description
    const desc = this.scene.add.text(0, 10, mod.description, {
      fontSize: '13px',
      color: '#B6B7B9',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: CARD_WIDTH - 32 },
    }).setOrigin(0.5);
    card.add(desc);

    // Hover effects
    bg.on('pointerover', () => {
      this.scene.tweens.add({
        targets: card,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Sine.easeOut',
      });
      bg.setStrokeStyle(3, catColor);
    });

    bg.on('pointerout', () => {
      this.scene.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Sine.easeOut',
      });
      bg.setStrokeStyle(2, CARD_BORDER_COLOR);
    });

    // Click: select this modifier
    bg.on('pointerdown', () => {
      this.animateSelection(card, mod);
    });

    return card;
  }

  private animateSelection(selectedCard: Phaser.GameObjects.Container, mod: WaveModifier): void {
    // Disable further input
    this.cards.forEach((card) => {
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      bg.disableInteractive();
    });

    // Fade out non-selected cards
    this.cards.forEach((card) => {
      if (card !== selectedCard) {
        this.scene.tweens.add({
          targets: card,
          alpha: 0,
          duration: 200,
        });
      }
    });

    // Scale up selected card briefly
    this.scene.tweens.add({
      targets: selectedCard,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        this.selectModifier(mod);
      },
    });
  }

  private selectModifier(mod: WaveModifier | null): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.autoDismissTimer) {
      this.autoDismissTimer.destroy();
      this.autoDismissTimer = null;
    }

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.destroy();
        this.onSelect(mod);
      },
    });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.autoDismissTimer) {
      this.autoDismissTimer.destroy();
      this.autoDismissTimer = null;
    }
    this.container.destroy();
  }
}
