export class AssetGenerator {
  static generate(scene: Phaser.Scene): void {
    this.generateTowerTextures(scene);
    this.generateEnemyTextures(scene);
    this.generateProjectileTextures(scene);
    this.generateUITextures(scene);
  }

  private static generateTowerTextures(scene: Phaser.Scene): void {
    const w = 40;
    const h = 48;

    // Firewall: blue rectangle with horizontal rule lines
    this.createTexture(scene, 'tower_firewall', w, h, (g) => {
      g.fillStyle(0x0076a8, 1);
      g.fillRect(4, 4, 32, 40);
      g.lineStyle(2, 0x00b4d8, 1);
      for (let y = 12; y < 40; y += 8) {
        g.beginPath();
        g.moveTo(8, y);
        g.lineTo(32, y);
        g.strokePath();
      }
      g.lineStyle(2, 0x48cae4, 1);
      g.strokeRect(4, 4, 32, 40);
    });

    // IDS: purple circle with radar sweep
    this.createTexture(scene, 'tower_ids', w, h, (g) => {
      g.fillStyle(0x753bbd, 1);
      g.fillCircle(20, 24, 18);
      g.lineStyle(2, 0xb388ff, 1);
      g.strokeCircle(20, 24, 18);
      // Radar lines
      g.lineStyle(1, 0xce93d8, 0.8);
      g.beginPath();
      g.moveTo(20, 24);
      g.lineTo(34, 14);
      g.strokePath();
      g.beginPath();
      g.arc(20, 24, 10, -0.8, 0.2, false);
      g.strokePath();
    });

    // WAF: orange shield shape
    this.createTexture(scene, 'tower_waf', w, h, (g) => {
      g.fillStyle(0xf47f28, 1);
      g.beginPath();
      g.moveTo(20, 4);
      g.lineTo(36, 14);
      g.lineTo(36, 30);
      g.lineTo(20, 44);
      g.lineTo(4, 30);
      g.lineTo(4, 14);
      g.closePath();
      g.fillPath();
      g.lineStyle(2, 0xffb74d, 1);
      g.strokePath();
      // Inner chevron
      g.lineStyle(2, 0xffffff, 0.6);
      g.beginPath();
      g.moveTo(14, 20);
      g.lineTo(20, 26);
      g.lineTo(26, 20);
      g.strokePath();
    });

    // Honeypot: yellow jar/pot shape
    this.createTexture(scene, 'tower_honeypot', w, h, (g) => {
      g.fillStyle(0xe7d747, 1);
      // Pot body
      g.fillRoundedRect(8, 18, 24, 26, 4);
      // Pot rim
      g.fillStyle(0xffd54f, 1);
      g.fillRect(6, 14, 28, 6);
      g.lineStyle(2, 0xc9b100, 1);
      g.strokeRoundedRect(8, 18, 24, 26, 4);
      g.strokeRect(6, 14, 28, 6);
      // Honey drip
      g.fillStyle(0xffab00, 1);
      g.fillCircle(20, 32, 4);
    });

    // Rate Limiter: teal gauge/speedometer
    this.createTexture(scene, 'tower_rate_limiter', w, h, (g) => {
      g.fillStyle(0x0093b2, 1);
      g.fillCircle(20, 26, 18);
      g.lineStyle(2, 0x4dd0e1, 1);
      g.strokeCircle(20, 26, 18);
      // Gauge arc
      g.lineStyle(3, 0xffffff, 0.7);
      g.beginPath();
      g.arc(20, 26, 12, Math.PI, 0, false);
      g.strokePath();
      // Needle
      g.lineStyle(2, 0xd9534f, 1);
      g.beginPath();
      g.moveTo(20, 26);
      g.lineTo(28, 16);
      g.strokePath();
      // Center dot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(20, 26, 3);
    });

    // Packet Inspector: green magnifying glass
    this.createTexture(scene, 'tower_packet_inspector', w, h, (g) => {
      g.fillStyle(0x84bd00, 0.3);
      g.fillCircle(18, 20, 14);
      g.lineStyle(3, 0x84bd00, 1);
      g.strokeCircle(18, 20, 14);
      // Handle
      g.lineStyle(4, 0x5ea500, 1);
      g.beginPath();
      g.moveTo(28, 30);
      g.lineTo(36, 42);
      g.strokePath();
      // Lens glare
      g.lineStyle(2, 0xffffff, 0.4);
      g.beginPath();
      g.arc(14, 16, 6, Math.PI * 1.2, Math.PI * 1.6, false);
      g.strokePath();
    });
  }

  private static generateEnemyTextures(scene: Phaser.Scene): void {
    const size = 24;

    // Threats (angular, aggressive shapes)

    // Malware: red irregular polygon
    this.createTexture(scene, 'enemy_malware', size, size, (g) => {
      g.fillStyle(0xd9534f, 1);
      g.beginPath();
      g.moveTo(12, 2);
      g.lineTo(22, 6);
      g.lineTo(20, 14);
      g.lineTo(24, 20);
      g.lineTo(16, 22);
      g.lineTo(8, 20);
      g.lineTo(2, 14);
      g.lineTo(4, 8);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xff6b6b, 1);
      g.strokePath();
    });

    // DDoS: small red circle
    this.createTexture(scene, 'enemy_ddos', size, size, (g) => {
      g.fillStyle(0xe53935, 1);
      g.fillCircle(12, 12, 8);
      g.lineStyle(1, 0xff8a80, 1);
      g.strokeCircle(12, 12, 8);
      // Burst lines
      g.lineStyle(1, 0xff5252, 0.6);
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        g.beginPath();
        g.moveTo(12 + Math.cos(angle) * 8, 12 + Math.sin(angle) * 8);
        g.lineTo(12 + Math.cos(angle) * 11, 12 + Math.sin(angle) * 11);
        g.strokePath();
      }
    });

    // Phishing: green circle (mimics legitimate)
    this.createTexture(scene, 'enemy_phishing', size, size, (g) => {
      g.fillStyle(0x66bb6a, 1);
      g.fillCircle(12, 12, 10);
      g.lineStyle(1, 0xa5d6a7, 1);
      g.strokeCircle(12, 12, 10);
      // Subtle warning: tiny red dot
      g.fillStyle(0xd9534f, 1);
      g.fillCircle(17, 7, 3);
    });

    // SQL Injection: orange syringe/needle shape
    this.createTexture(scene, 'enemy_sql_injection', size, size, (g) => {
      g.fillStyle(0xf47f28, 1);
      // Barrel
      g.fillRect(4, 8, 14, 8);
      // Needle
      g.lineStyle(2, 0xff9800, 1);
      g.beginPath();
      g.moveTo(18, 12);
      g.lineTo(23, 12);
      g.strokePath();
      // Plunger
      g.fillStyle(0xffa726, 1);
      g.fillRect(2, 10, 4, 4);
      g.lineStyle(1, 0xffcc80, 1);
      g.strokeRect(4, 8, 14, 8);
    });

    // Ransomware C2: dark red padlock
    this.createTexture(scene, 'enemy_ransomware_c2', size, size, (g) => {
      g.fillStyle(0xb71c1c, 1);
      // Lock body
      g.fillRoundedRect(5, 12, 14, 10, 2);
      // Shackle
      g.lineStyle(3, 0xd32f2f, 1);
      g.beginPath();
      g.arc(12, 12, 6, Math.PI, 0, false);
      g.strokePath();
      // Keyhole
      g.fillStyle(0x000000, 1);
      g.fillCircle(12, 17, 2);
      g.fillRect(11, 17, 2, 4);
    });

    // Zero Day: semi-transparent gray shape
    this.createTexture(scene, 'enemy_zero_day', size, size, (g) => {
      g.fillStyle(0x9e9e9e, 0.3);
      g.fillCircle(12, 12, 10);
      g.lineStyle(1, 0xbdbdbd, 0.3);
      g.strokeCircle(12, 12, 10);
      // Question mark
      g.lineStyle(2, 0xffffff, 0.4);
      g.beginPath();
      g.arc(12, 10, 4, Math.PI * 1.2, Math.PI * 0.2, false);
      g.strokePath();
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(12, 17, 1.5);
    });

    // Legitimate traffic (smooth, rounded, cool colors)

    // HTTP Request: blue circle
    this.createTexture(scene, 'enemy_http_request', size, size, (g) => {
      g.fillStyle(0x42a5f5, 1);
      g.fillCircle(12, 12, 10);
      g.lineStyle(1, 0x90caf9, 1);
      g.strokeCircle(12, 12, 10);
      // H letter
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(8, 7);
      g.lineTo(8, 17);
      g.moveTo(16, 7);
      g.lineTo(16, 17);
      g.moveTo(8, 12);
      g.lineTo(16, 12);
      g.strokePath();
    });

    // DNS Query: green diamond
    this.createTexture(scene, 'enemy_dns_query', size, size, (g) => {
      g.fillStyle(0x66bb6a, 1);
      g.beginPath();
      g.moveTo(12, 2);
      g.lineTo(22, 12);
      g.lineTo(12, 22);
      g.lineTo(2, 12);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xa5d6a7, 1);
      g.strokePath();
    });

    // API Call: blue rounded rectangle
    this.createTexture(scene, 'enemy_api_call', size, size, (g) => {
      g.fillStyle(0x5c6bc0, 1);
      g.fillRoundedRect(3, 6, 18, 12, 4);
      g.lineStyle(1, 0x9fa8da, 1);
      g.strokeRoundedRect(3, 6, 18, 12, 4);
      // Brackets {}
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(8, 9);
      g.lineTo(6, 12);
      g.lineTo(8, 15);
      g.moveTo(16, 9);
      g.lineTo(18, 12);
      g.lineTo(16, 15);
      g.strokePath();
    });

    // Email: green envelope shape
    this.createTexture(scene, 'enemy_email', size, size, (g) => {
      g.fillStyle(0x4caf50, 1);
      g.fillRect(3, 7, 18, 12);
      g.lineStyle(1, 0x81c784, 1);
      g.strokeRect(3, 7, 18, 12);
      // Envelope flap
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(3, 7);
      g.lineTo(12, 14);
      g.lineTo(21, 7);
      g.strokePath();
    });
  }

  private static generateProjectileTextures(scene: Phaser.Scene): void {
    const size = 8;

    const projectiles: Array<{ key: string; color: number }> = [
      { key: 'projectile_firewall', color: 0x0076a8 },
      { key: 'projectile_ids', color: 0x753bbd },
      { key: 'projectile_waf', color: 0xf47f28 },
      { key: 'projectile_honeypot', color: 0xe7d747 },
      { key: 'projectile_rate_limiter', color: 0x0093b2 },
      { key: 'projectile_packet_inspector', color: 0x84bd00 },
    ];

    for (const { key, color } of projectiles) {
      this.createTexture(scene, key, size, size, (g) => {
        g.fillStyle(color, 1);
        g.fillCircle(4, 4, 3);
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(3, 3, 1);
      });
    }
  }

  private static generateUITextures(scene: Phaser.Scene): void {
    // Empty tower slot indicator (44x44)
    this.createTexture(scene, 'ui_slot_empty', 44, 44, (g) => {
      g.fillStyle(0x044872, 0.4);
      g.fillRect(0, 0, 44, 44);
      g.lineStyle(1, 0x0093b2, 0.6);
      g.strokeRect(1, 1, 42, 42);
      // Plus sign
      g.lineStyle(2, 0x0093b2, 0.4);
      g.beginPath();
      g.moveTo(22, 14);
      g.lineTo(22, 30);
      g.moveTo(14, 22);
      g.lineTo(30, 22);
      g.strokePath();
    });

    // Hovered slot (44x44)
    this.createTexture(scene, 'ui_slot_hover', 44, 44, (g) => {
      g.fillStyle(0x0093b2, 0.5);
      g.fillRect(0, 0, 44, 44);
      g.lineStyle(2, 0x84bd00, 1);
      g.strokeRect(1, 1, 42, 42);
    });

    // Range circle (generic, will be scaled at runtime)
    this.createTexture(scene, 'ui_range_circle', 64, 64, (g) => {
      g.fillStyle(0x0076a8, 0.1);
      g.fillCircle(32, 32, 30);
      g.lineStyle(1, 0x0076a8, 0.3);
      g.strokeCircle(32, 32, 30);
    });
  }

  private static createTexture(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    draw: (g: Phaser.GameObjects.Graphics) => void,
  ): void {
    const g = scene.add.graphics();
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }
}
