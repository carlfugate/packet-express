import Phaser from 'phaser';
import type { QuizQuestion } from '../logic/quiz';

export class QuizModal {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(640, 360).setVisible(false).setDepth(1000);
  }

  show(data: { question: QuizQuestion; questionIndex: number }): void {
    this.container.removeAll(true);
    this.visible = true;

    // Background overlay
    const bg = this.scene.add.rectangle(0, 0, 600, 400, 0x044872, 0.95);
    bg.setStrokeStyle(3, 0x0093B2);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(0, -160, 'SECURITY KNOWLEDGE CHECK', {
      fontSize: '20px', color: '#84BD00', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(title);

    // Question text
    const qText = this.scene.add.text(0, -100, data.question.question, {
      fontSize: '16px', color: '#FFFFFF', fontFamily: 'Arial',
      wordWrap: { width: 520 }, align: 'center'
    }).setOrigin(0.5);
    this.container.add(qText);

    // Answer buttons
    data.question.answers.forEach((answer, i) => {
      const y = -30 + i * 55;
      const btn = this.scene.add.rectangle(0, y, 500, 44, 0x0A1628);
      btn.setStrokeStyle(2, 0x0093B2);
      btn.setInteractive({ useHandCursor: true });

      const label = this.scene.add.text(0, y, answer, {
        fontSize: '14px', color: '#FFFFFF', fontFamily: 'Arial'
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setStrokeStyle(2, 0xF47F28));
      btn.on('pointerout', () => btn.setStrokeStyle(2, 0x0093B2));
      btn.on('pointerdown', () => {
        this.scene.events.emit('quiz-answer-submitted', {
          questionIndex: data.questionIndex,
          answerIndex: i,
        });
      });

      this.container.add([btn, label]);
    });

    this.container.setVisible(true);
  }

  showResult(correct: boolean): void {
    const text = correct ? 'CORRECT! +1 Upgrade Token' : 'INCORRECT';
    const color = correct ? '#84BD00' : '#D9534F';
    const result = this.scene.add.text(0, 150, text, {
      fontSize: '18px', color, fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.container.add(result);

    this.scene.time.delayedCall(1500, () => this.hide());
  }

  hide(): void {
    this.container.setVisible(false);
    this.container.removeAll(true);
    this.visible = false;
  }

  isVisible(): boolean { return this.visible; }
}
