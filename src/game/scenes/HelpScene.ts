import Phaser from 'phaser';

interface HelpPage {
  title: string;
  content: (scene: HelpScene) => Phaser.GameObjects.GameObject[];
}

export class HelpScene extends Phaser.Scene {
  private currentPage: number = 0;
  private pages: HelpPage[] = [];
  private pageContainer!: Phaser.GameObjects.Container;
  private pageIndicator!: Phaser.GameObjects.Text;
  private prevBtn!: Phaser.GameObjects.Text;
  private nextBtn!: Phaser.GameObjects.Text;
  private returnScene: string = 'Menu';
  private wasGamePaused: boolean = false;

  constructor() {
    super({ key: 'Help' });
  }

  init(data: { returnTo?: string; gamePaused?: boolean }): void {
    this.returnScene = data.returnTo ?? 'Menu';
    this.wasGamePaused = data.gamePaused ?? false;
  }

  create(): void {
    this.currentPage = 0;
    this.pages = this.buildPages();

    // Dark navy background
    this.add.rectangle(640, 360, 1280, 720, 0x044872, 1);

    // Title bar
    this.add.rectangle(640, 40, 1280, 60, 0x0a1628, 0.9);
    this.add.text(640, 40, 'HOW TO PLAY', {
      fontSize: '32px',
      color: '#0076A8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Close button (top-right)
    const closeBtn = this.add.text(1220, 40, 'CLOSE [X]', {
      fontSize: '18px',
      color: '#F47F28',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeHelp());
    closeBtn.on('pointerover', () => closeBtn.setColor('#FFFFFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#F47F28'));

    // Page content container
    this.pageContainer = this.add.container(0, 0);

    // Navigation
    this.prevBtn = this.add.text(200, 680, '< PREV', {
      fontSize: '20px',
      color: '#0093B2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.prevBtn.on('pointerdown', () => this.changePage(-1));
    this.prevBtn.on('pointerover', () => this.prevBtn.setColor('#FFFFFF'));
    this.prevBtn.on('pointerout', () => this.prevBtn.setColor('#0093B2'));

    this.nextBtn = this.add.text(1080, 680, 'NEXT >', {
      fontSize: '20px',
      color: '#0093B2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.nextBtn.on('pointerdown', () => this.changePage(1));
    this.nextBtn.on('pointerover', () => this.nextBtn.setColor('#FFFFFF'));
    this.nextBtn.on('pointerout', () => this.nextBtn.setColor('#0093B2'));

    this.pageIndicator = this.add.text(640, 680, '', {
      fontSize: '16px',
      color: '#B6B7B9',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Keyboard controls
    this.input.keyboard?.on('keydown-ESC', () => this.closeHelp());
    this.input.keyboard?.on('keydown-LEFT', () => this.changePage(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.changePage(1));

    // Render first page
    this.renderPage();
  }

  private closeHelp(): void {
    if (this.returnScene === 'Game') {
      this.scene.stop('Help');
      // Resume game if it was paused by opening help
      if (!this.wasGamePaused) {
        const gameScene = this.scene.get('Game') as any;
        if (gameScene && gameScene.resumeFromHelp) {
          gameScene.resumeFromHelp();
        }
      }
    } else {
      this.scene.stop('Help');
      this.scene.start('Menu');
    }
  }

  private changePage(direction: number): void {
    const newPage = this.currentPage + direction;
    if (newPage < 0 || newPage >= this.pages.length) return;
    this.currentPage = newPage;
    this.renderPage();
  }

  private renderPage(): void {
    this.pageContainer.removeAll(true);
    const page = this.pages[this.currentPage];

    // Page title
    const title = this.add.text(640, 100, page.title, {
      fontSize: '28px',
      color: '#84BD00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.pageContainer.add(title);

    // Page content
    const items = page.content(this);
    items.forEach((item) => this.pageContainer.add(item));

    // Update navigation
    this.pageIndicator.setText(`${this.currentPage + 1} / ${this.pages.length}`);
    this.prevBtn.setAlpha(this.currentPage === 0 ? 0.3 : 1);
    this.nextBtn.setAlpha(this.currentPage === this.pages.length - 1 ? 0.3 : 1);
  }

  private buildPages(): HelpPage[] {
    return [
      { title: 'OBJECTIVE', content: (s) => s.buildObjectivePage() },
      { title: 'DIFFICULTY MODES', content: (s) => s.buildDifficultyPage() },
      { title: 'TOWERS', content: (s) => s.buildTowersPage() },
      { title: 'ENEMIES', content: (s) => s.buildEnemiesPage() },
      { title: 'SCORING', content: (s) => s.buildScoringPage() },
      { title: 'CONTROLS', content: (s) => s.buildControlsPage() },
      { title: 'QUIZ SYSTEM', content: (s) => s.buildQuizPage() },
    ];
  }

  private buildObjectivePage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    const x = 640;
    let y = 160;

    items.push(this.add.text(x, y, 'Defend the network!', {
      fontSize: '22px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5));
    y += 40;

    items.push(this.add.text(x, y, 'Block malicious traffic before it reaches Chicago.', {
      fontSize: '18px', color: '#B6B7B9', fontFamily: 'Arial',
    }).setOrigin(0.5));
    y += 60;

    items.push(this.add.text(x, y, 'BUT: Don\'t block legitimate packets \u2014', {
      fontSize: '20px', color: '#F47F28', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5));
    y += 30;

    items.push(this.add.text(x, y, 'false positives cost you dearly!', {
      fontSize: '20px', color: '#F47F28', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5));
    y += 80;

    // Visual diagram: track with threats and legitimate
    const trackY = y + 40;
    // Track line
    const trackLine = this.add.rectangle(640, trackY, 600, 6, 0x7a7b7c, 1);
    items.push(trackLine);

    // KC label
    items.push(this.add.text(300, trackY - 30, 'KC', {
      fontSize: '14px', color: '#84BD00', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5));

    // CHI label
    items.push(this.add.text(980, trackY - 30, 'CHI', {
      fontSize: '14px', color: '#F47F28', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0.5));

    // Threat packets (red)
    const threatPositions = [420, 520, 650];
    threatPositions.forEach((px) => {
      const threat = this.add.rectangle(px, trackY, 18, 18, 0xd9534f, 1);
      threat.setAngle(45);
      items.push(threat);
    });

    // Legitimate packets (green)
    const legitPositions = [480, 580, 720];
    legitPositions.forEach((px) => {
      const legit = this.add.circle(px, trackY, 9, 0x84bd00, 1);
      items.push(legit);
    });

    // Legend
    const legendY = trackY + 60;
    items.push(this.add.rectangle(530, legendY, 14, 14, 0xd9534f, 1));
    items.push(this.add.text(545, legendY, 'Threats \u2014 BLOCK these!', {
      fontSize: '15px', color: '#D9534F', fontFamily: 'Arial',
    }).setOrigin(0, 0.5));

    items.push(this.add.circle(530, legendY + 30, 7, 0x84bd00, 1));
    items.push(this.add.text(545, legendY + 30, 'Legitimate \u2014 Let these through!', {
      fontSize: '15px', color: '#84BD00', fontFamily: 'Arial',
    }).setOrigin(0, 0.5));

    return items;
  }

  private buildDifficultyPage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    const x = 640;
    let y = 160;

    items.push(this.add.text(x, y, 'Choose your challenge level from the menu.', {
      fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial',
    }).setOrigin(0.5));
    y += 60;

    const modes = [
      { name: 'ANALYST', color: '#5EA500', desc: 'More resources, slower enemies, reduced penalties. Great for learning.' },
      { name: 'ENGINEER', color: '#E7D747', desc: 'Standard tempo. The intended experience.' },
      { name: 'INCIDENT COMMANDER', color: '#D9534F', desc: 'Faster threats, tight budget, amplified penalties. For veterans.' },
    ];

    modes.forEach((mode) => {
      items.push(this.add.text(x, y, mode.name, {
        fontSize: '22px', color: mode.color, fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0.5));
      y += 30;

      items.push(this.add.text(x, y, mode.desc, {
        fontSize: '15px', color: '#B6B7B9', fontFamily: 'Arial',
        wordWrap: { width: 600 },
      }).setOrigin(0.5));
      y += 60;
    });

    y += 20;
    items.push(this.add.text(x, y, 'Difficulty affects: enemy count, speed, health, starting resources, and FP penalties.', {
      fontSize: '14px', color: '#0093B2', fontFamily: 'Arial', fontStyle: 'italic',
      wordWrap: { width: 600 },
    }).setOrigin(0.5));

    return items;
  }

  private buildTowersPage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    const startY = 150;
    const lineH = 70;

    const towers = [
      { name: 'Firewall', color: 0x0076a8, desc: 'Blocks threats. Won\'t hit legitimate traffic. Safe choice.', risky: false },
      { name: 'IDS', color: 0x753bbd, desc: 'High damage. CAN false-positive. Risk/reward.', risky: true },
      { name: 'WAF', color: 0xf47f28, desc: 'Extra damage vs web attacks. CAN false-positive.', risky: true },
      { name: 'Honeypot', color: 0xe7d747, desc: 'Slows enemies. Won\'t hit legitimate traffic.', risky: false },
      { name: 'Rate Limiter', color: 0x0093b2, desc: 'Slows everything including legit. Use carefully.', risky: true },
      { name: 'Packet Inspector', color: 0x84bd00, desc: 'Reveals hidden threats. Expensive but essential.', risky: false },
    ];

    towers.forEach((tower, i) => {
      const y = startY + i * lineH;

      // Colored square icon
      const icon = this.add.rectangle(160, y, 20, 20, tower.color, 1);
      icon.setStrokeStyle(1, 0xffffff, 0.4);
      items.push(icon);

      // Name
      items.push(this.add.text(185, y - 10, tower.name, {
        fontSize: '18px', color: '#FFFFFF', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0, 0.5));

      // Description
      items.push(this.add.text(185, y + 12, tower.desc, {
        fontSize: '14px',
        color: tower.risky ? '#F47F28' : '#B6B7B9',
        fontFamily: 'Arial',
      }).setOrigin(0, 0.5));

      // Risk warning marker
      if (tower.risky) {
        items.push(this.add.text(1100, y, '\u26a0 RISKY', {
          fontSize: '13px', color: '#D9534F', fontFamily: 'Arial', fontStyle: 'bold',
        }).setOrigin(0.5));
      }
    });

    // Bottom note
    items.push(this.add.text(640, startY + towers.length * lineH + 20,
      '\u26a0 Risky towers can hit legitimate traffic \u2014 use with precision!', {
        fontSize: '15px', color: '#F47F28', fontFamily: 'Arial', fontStyle: 'italic',
      }).setOrigin(0.5));

    return items;
  }

  private buildEnemiesPage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    let y = 140;

    // Threats section
    items.push(this.add.text(300, y, 'THREATS \u2014 Block these!', {
      fontSize: '18px', color: '#D9534F', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    y += 35;

    const threats = [
      { name: 'Malware', color: 0xd9534f, desc: 'Standard threat', symbol: 'star' },
      { name: 'SYN Flood', color: 0xd9534f, desc: 'Swarm, overwhelm by numbers', symbol: 'dot' },
      { name: 'Phishing', color: 0x84bd00, desc: 'Looks legitimate until revealed!', symbol: 'disguised' },
      { name: 'SQL Injection', color: 0xf47f28, desc: 'Bypasses basic firewalls', symbol: 'point' },
      { name: 'Ransomware C2', color: 0x8b0000, desc: 'Heals over time, encrypted', symbol: 'lock' },
      { name: 'Zero-Day', color: 0x555555, desc: 'Only Packet Inspector can reveal', symbol: 'ghost' },
    ];

    threats.forEach((t) => {
      const icon = this.add.rectangle(320, y, 14, 14, t.color, 1);
      items.push(icon);
      items.push(this.add.text(340, y, `${t.name} \u2014 ${t.desc}`, {
        fontSize: '14px', color: '#FFFFFF', fontFamily: 'Arial',
      }).setOrigin(0, 0.5));
      y += 28;
    });

    y += 20;
    // Legitimate section
    items.push(this.add.text(300, y, 'LEGITIMATE \u2014 Let these through!', {
      fontSize: '18px', color: '#84BD00', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    y += 35;

    const legit = [
      { name: 'HTTP', color: 0x0076a8 },
      { name: 'DNS', color: 0x84bd00 },
      { name: 'API Call', color: 0x0093b2 },
      { name: 'Email', color: 0x5ea500 },
    ];

    legit.forEach((l) => {
      const icon = this.add.circle(320, y, 7, l.color, 1);
      items.push(icon);
      items.push(this.add.text(340, y, l.name, {
        fontSize: '14px', color: '#84BD00', fontFamily: 'Arial',
      }).setOrigin(0, 0.5));
      y += 28;
    });

    y += 15;
    items.push(this.add.text(640, y, 'If you block legitimate traffic, you lose points!', {
      fontSize: '16px', color: '#F47F28', fontFamily: 'Arial', fontStyle: 'italic',
    }).setOrigin(0.5));

    return items;
  }

  private buildScoringPage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    const x = 640;
    let y = 170;

    const lines = [
      { text: 'Kill threats = points', color: '#84BD00' },
      { text: 'Block legitimate = penalty (false positive)', color: '#D9534F' },
      { text: '', color: '' },
      { text: 'Accuracy Multiplier at wave end:', color: '#FFFFFF' },
      { text: '100% accuracy \u2192 1.5x score', color: '#5EA500' },
      { text: '90%+ accuracy \u2192 1.2x score', color: '#84BD00' },
      { text: '70%+ accuracy \u2192 1.0x score', color: '#E7D747' },
      { text: 'Below 50% \u2192 0.5x score', color: '#D9534F' },
      { text: '', color: '' },
      { text: '"Precision beats firepower"', color: '#0093B2' },
    ];

    lines.forEach((line) => {
      if (line.text === '') {
        y += 20;
        return;
      }
      items.push(this.add.text(x, y, line.text, {
        fontSize: '18px', color: line.color, fontFamily: 'Arial',
      }).setOrigin(0.5));
      y += 36;
    });

    return items;
  }

  private buildControlsPage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    let y = 150;
    const leftX = 340;
    const rightX = 760;

    items.push(this.add.text(leftX, y, 'MOUSE', {
      fontSize: '18px', color: '#0093B2', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    y += 35;

    const mouseControls = [
      'Click tower in bottom bar to select',
      'Click platform on map to place',
      'Click placed tower for range/upgrade/sell',
    ];
    mouseControls.forEach((ctrl) => {
      items.push(this.add.text(leftX, y, `\u2022 ${ctrl}`, {
        fontSize: '15px', color: '#FFFFFF', fontFamily: 'Arial',
      }).setOrigin(0, 0.5));
      y += 28;
    });

    y += 20;
    items.push(this.add.text(leftX, y, 'KEYBOARD', {
      fontSize: '18px', color: '#0093B2', fontFamily: 'Arial', fontStyle: 'bold',
    }).setOrigin(0, 0.5));
    y += 35;

    const keyControls = [
      { key: 'SPACE', desc: 'Call next wave early (bonus credits)' },
      { key: 'ESC', desc: 'Pause' },
      { key: 'H', desc: 'This help screen' },
      { key: '1 / 2 / 3', desc: 'Game speed' },
    ];
    keyControls.forEach((ctrl) => {
      items.push(this.add.text(leftX, y, ctrl.key, {
        fontSize: '15px', color: '#84BD00', fontFamily: 'Arial', fontStyle: 'bold',
      }).setOrigin(0, 0.5));
      items.push(this.add.text(leftX + 120, y, ctrl.desc, {
        fontSize: '15px', color: '#FFFFFF', fontFamily: 'Arial',
      }).setOrigin(0, 0.5));
      y += 30;
    });

    return items;
  }

  private buildQuizPage(): Phaser.GameObjects.GameObject[] {
    const items: Phaser.GameObjects.GameObject[] = [];
    const x = 640;
    let y = 180;

    const lines = [
      { text: 'Kill enemies to earn XP', color: '#84BD00' },
      { text: 'Level up triggers a security quiz', color: '#FFFFFF' },
      { text: 'Correct answer = upgrade token', color: '#E7D747' },
      { text: '(needed to upgrade towers)', color: '#B6B7B9' },
      { text: '', color: '' },
      { text: 'Questions get harder as you level up', color: '#0093B2' },
      { text: '', color: '' },
      { text: 'Study up on your security knowledge!', color: '#F47F28' },
    ];

    lines.forEach((line) => {
      if (line.text === '') {
        y += 25;
        return;
      }
      items.push(this.add.text(x, y, line.text, {
        fontSize: '20px', color: line.color, fontFamily: 'Arial',
      }).setOrigin(0.5));
      y += 40;
    });

    return items;
  }
}
