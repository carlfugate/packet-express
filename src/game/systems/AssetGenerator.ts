export class AssetGenerator {
  static generate(scene: Phaser.Scene): void {
    this.generateTowerTextures(scene);
    this.generateEnemyTextures(scene);
    this.generateProjectileTextures(scene);
    this.generateUITextures(scene);
    this.generateEffectTextures(scene);
  }

  private static generateTowerTextures(scene: Phaser.Scene): void {
    const w = 40;
    const h = 48;

    // Firewall: Blue brick wall with data lines and lock icon
    this.createTexture(scene, 'tower_firewall', w, h, (g) => {
      // Dark blue border/base
      g.fillStyle(0x044872, 1);
      g.fillRect(4, 6, 32, 38);
      // Blue wall body
      g.fillStyle(0x0076a8, 1);
      g.fillRect(6, 8, 28, 34);
      // Brick pattern
      g.lineStyle(1, 0x044872, 0.6);
      for (let row = 0; row < 5; row++) {
        const y = 12 + row * 7;
        g.beginPath();
        g.moveTo(6, y);
        g.lineTo(34, y);
        g.strokePath();
        const offset = row % 2 === 0 ? 0 : 7;
        for (let col = 0; col < 4; col++) {
          const x = 10 + col * 7 + offset;
          if (x < 34) {
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x, y + 7);
            g.strokePath();
          }
        }
      }
      // 3 horizontal data lines (glowing)
      g.lineStyle(2, 0x48cae4, 0.9);
      g.beginPath();
      g.moveTo(9, 18);
      g.lineTo(31, 18);
      g.strokePath();
      g.beginPath();
      g.moveTo(9, 26);
      g.lineTo(31, 26);
      g.strokePath();
      g.beginPath();
      g.moveTo(9, 34);
      g.lineTo(31, 34);
      g.strokePath();
      // Lock icon at top
      g.lineStyle(2, 0xffffff, 0.9);
      g.beginPath();
      g.arc(20, 7, 3, Math.PI, 0, false);
      g.strokePath();
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(17, 7, 6, 5);
      // Border highlight
      g.lineStyle(2, 0x044872, 1);
      g.strokeRect(4, 6, 32, 38);
    });

    // IDS: Purple octagon with eye and radar sweep
    this.createTexture(scene, 'tower_ids', w, h, (g) => {
      // Glow around edges
      g.fillStyle(0x753bbd, 0.2);
      g.fillCircle(20, 24, 22);
      // Octagon shape
      g.fillStyle(0x753bbd, 1);
      g.beginPath();
      const cx = 20, cy = 24, r = 18;
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 8;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      // Lighter purple border
      g.lineStyle(2, 0xb388ff, 1);
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 8;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.strokePath();
      // Eye: white sclera
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx, cy, 8);
      // Purple iris
      g.fillStyle(0x753bbd, 1);
      g.fillCircle(cx, cy, 5);
      // Black pupil
      g.fillStyle(0x000000, 1);
      g.fillCircle(cx, cy, 2);
      // Eye highlight
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(cx + 2, cy - 2, 1.5);
      // Radar sweep arc
      g.fillStyle(0x00ff88, 0.25);
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, 17, -1.0, -0.4, false);
      g.closePath();
      g.fillPath();
      // Radar sweep line
      g.lineStyle(2, 0x00ff88, 0.9);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(-0.4) * 17, cy + Math.sin(-0.4) * 17);
      g.strokePath();
    });

    // WAF: Orange shield with W letter
    this.createTexture(scene, 'tower_waf', w, h, (g) => {
      // Darker edge gradient (outer shield)
      g.fillStyle(0xc45a10, 1);
      g.beginPath();
      g.moveTo(20, 2);
      g.lineTo(36, 10);
      g.lineTo(36, 30);
      g.lineTo(20, 44);
      g.lineTo(4, 30);
      g.lineTo(4, 10);
      g.closePath();
      g.fillPath();
      // Inner shield (brighter orange)
      g.fillStyle(0xf47f28, 1);
      g.beginPath();
      g.moveTo(20, 6);
      g.lineTo(32, 12);
      g.lineTo(32, 28);
      g.lineTo(20, 40);
      g.lineTo(8, 28);
      g.lineTo(8, 12);
      g.closePath();
      g.fillPath();
      // Inner highlight
      g.fillStyle(0xffb74d, 0.3);
      g.beginPath();
      g.moveTo(20, 10);
      g.lineTo(28, 14);
      g.lineTo(28, 22);
      g.lineTo(20, 30);
      g.lineTo(12, 22);
      g.lineTo(12, 14);
      g.closePath();
      g.fillPath();
      // W letter in white
      g.lineStyle(3, 0xffffff, 1);
      g.beginPath();
      g.moveTo(11, 16);
      g.lineTo(14, 32);
      g.lineTo(20, 24);
      g.lineTo(26, 32);
      g.lineTo(29, 16);
      g.strokePath();
      // Shield border
      g.lineStyle(2, 0xffb74d, 1);
      g.beginPath();
      g.moveTo(20, 2);
      g.lineTo(36, 10);
      g.lineTo(36, 30);
      g.lineTo(20, 44);
      g.lineTo(4, 30);
      g.lineTo(4, 10);
      g.closePath();
      g.strokePath();
    });

    // Honeypot: Yellow pot/jar with honey drips
    this.createTexture(scene, 'tower_honeypot', w, h, (g) => {
      // Jar body (round bottom, narrow neck, wide rim)
      g.fillStyle(0xe7d747, 1);
      g.beginPath();
      g.moveTo(12, 16);
      g.lineTo(10, 20);
      g.lineTo(8, 30);
      g.arc(20, 36, 12, Math.PI, 0, false);
      g.lineTo(30, 20);
      g.lineTo(28, 16);
      g.closePath();
      g.fillPath();
      // Amber fill inside (darker)
      g.fillStyle(0xc9a800, 0.6);
      g.beginPath();
      g.moveTo(12, 22);
      g.lineTo(10, 30);
      g.arc(20, 36, 10, Math.PI, 0, false);
      g.lineTo(28, 22);
      g.closePath();
      g.fillPath();
      // Narrow neck
      g.fillStyle(0xe7d747, 1);
      g.fillRect(14, 10, 12, 8);
      // Wide rim
      g.fillStyle(0xffd54f, 1);
      g.fillRect(10, 8, 20, 4);
      // Darker border
      g.lineStyle(2, 0xa89000, 1);
      g.beginPath();
      g.moveTo(12, 16);
      g.lineTo(10, 20);
      g.lineTo(8, 30);
      g.arc(20, 36, 12, Math.PI, 0, false);
      g.lineTo(30, 20);
      g.lineTo(28, 16);
      g.closePath();
      g.strokePath();
      g.strokeRect(10, 8, 20, 4);
      // Honey drips from rim
      g.fillStyle(0xffab00, 1);
      g.fillCircle(13, 14, 2);
      g.fillRect(12, 10, 2, 4);
      g.fillCircle(27, 15, 2.5);
      g.fillRect(26, 10, 2, 5);
      g.fillCircle(20, 13, 1.5);
      g.fillRect(19, 10, 2, 3);
    });

    this.generateTowerTexturesPart2(scene, w, h);
  }

  private static generateTowerTexturesPart2(scene: Phaser.Scene, w: number, h: number): void {
    // Rate Limiter: Teal speedometer/gauge
    this.createTexture(scene, 'tower_rate_limiter', w, h, (g) => {
      const cx = 20, cy = 28;
      // Gauge body
      g.fillStyle(0x0093b2, 1);
      g.beginPath();
      g.arc(cx, cy, 19, Math.PI, 0, false);
      g.lineTo(39, 44);
      g.lineTo(1, 44);
      g.closePath();
      g.fillPath();
      // Border
      g.lineStyle(2, 0x4dd0e1, 1);
      g.beginPath();
      g.arc(cx, cy, 19, Math.PI, 0, false);
      g.strokePath();
      // Gauge arc (white)
      g.lineStyle(3, 0xffffff, 0.5);
      g.beginPath();
      g.arc(cx, cy, 14, Math.PI + 0.2, -0.2, false);
      g.strokePath();
      // Red zone (right side of gauge)
      g.lineStyle(4, 0xd9534f, 0.8);
      g.beginPath();
      g.arc(cx, cy, 14, -0.8, -0.2, false);
      g.strokePath();
      // Tick marks
      for (let i = 0; i <= 6; i++) {
        const angle = Math.PI + (Math.PI * i) / 6;
        const inner = 11;
        const outer = 16;
        g.lineStyle(2, 0xffffff, 0.7);
        g.beginPath();
        g.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        g.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        g.strokePath();
      }
      // Needle pointing right (danger zone)
      const needleAngle = Math.PI + Math.PI * 0.75;
      g.lineStyle(3, 0xd9534f, 1);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(needleAngle) * 13, cy + Math.sin(needleAngle) * 13);
      g.strokePath();
      // Center cap
      g.fillStyle(0xffffff, 1);
      g.fillCircle(cx, cy, 3);
    });

    // Packet Inspector: Green magnifying glass with crosshair
    this.createTexture(scene, 'tower_packet_inspector', w, h, (g) => {
      const lx = 16, ly = 18, lr = 13;
      // Lens fill (light green tint)
      g.fillStyle(0x84bd00, 0.2);
      g.fillCircle(lx, ly, lr);
      // Crosshair lines inside lens
      g.lineStyle(1, 0x84bd00, 0.5);
      g.beginPath();
      g.moveTo(lx - 8, ly);
      g.lineTo(lx + 8, ly);
      g.strokePath();
      g.beginPath();
      g.moveTo(lx, ly - 8);
      g.lineTo(lx, ly + 8);
      g.strokePath();
      // Small crosshair circle
      g.lineStyle(1, 0x84bd00, 0.4);
      g.strokeCircle(lx, ly, 5);
      // Lens ring
      g.lineStyle(4, 0x84bd00, 1);
      g.strokeCircle(lx, ly, lr);
      // Handle
      g.lineStyle(5, 0x5ea500, 1);
      g.beginPath();
      g.moveTo(lx + lr * 0.7, ly + lr * 0.7);
      g.lineTo(36, 42);
      g.strokePath();
      // Handle grip
      g.lineStyle(4, 0x3d7000, 1);
      g.beginPath();
      g.moveTo(34, 40);
      g.lineTo(38, 45);
      g.strokePath();
      // Sparkle highlight
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(lx - 4, ly - 5, 2);
      g.fillCircle(lx - 6, ly - 3, 1);
    });

    // Data Diode: Dark green rectangle with white one-way arrow
    this.createTexture(scene, 'tower_data_diode', w, h, (g) => {
      // Main body
      g.fillStyle(0x2e7d32, 1);
      g.fillRect(4, 10, 32, 28);
      // Border
      g.lineStyle(2, 0x4caf50, 1);
      g.strokeRect(4, 10, 32, 28);
      // Left barrier line (red)
      g.lineStyle(3, 0xd9534f, 0.8);
      g.beginPath();
      g.moveTo(8, 12);
      g.lineTo(8, 36);
      g.strokePath();
      // Large white arrow pointing RIGHT
      g.fillStyle(0xffffff, 1);
      g.beginPath();
      g.moveTo(12, 20);
      g.lineTo(24, 20);
      g.lineTo(24, 15);
      g.lineTo(34, 24);
      g.lineTo(24, 33);
      g.lineTo(24, 28);
      g.lineTo(12, 28);
      g.closePath();
      g.fillPath();
      // Direction indicator dots
      g.fillStyle(0x84bd00, 0.6);
      g.fillCircle(15, 24, 1.5);
      g.fillCircle(19, 24, 1.5);
    });

    // Network Segmentation: Yellow/black hazard split with zigzag
    this.createTexture(scene, 'tower_network_segmentation', w, h, (g) => {
      // Left half (dark/black)
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(4, 6, 16, 36);
      // Right half (yellow)
      g.fillStyle(0xe7d747, 1);
      g.fillRect(20, 6, 16, 36);
      // Hazard stripes on left side
      g.lineStyle(2, 0xe7d747, 0.7);
      for (let i = 0; i < 6; i++) {
        const y = 8 + i * 7;
        g.beginPath();
        g.moveTo(4, y);
        g.lineTo(12, y + 5);
        g.strokePath();
      }
      // Hazard stripes on right side
      g.lineStyle(2, 0x1a1a1a, 0.7);
      for (let i = 0; i < 6; i++) {
        const y = 8 + i * 7;
        g.beginPath();
        g.moveTo(28, y);
        g.lineTo(36, y + 5);
        g.strokePath();
      }
      // Zigzag fence line down the middle
      g.lineStyle(3, 0xd9534f, 1);
      g.beginPath();
      g.moveTo(20, 6);
      for (let i = 0; i < 9; i++) {
        const y = 10 + i * 4;
        const x = i % 2 === 0 ? 17 : 23;
        g.lineTo(x, y);
      }
      g.lineTo(20, 42);
      g.strokePath();
      // Border
      g.lineStyle(2, 0x555555, 1);
      g.strokeRect(4, 6, 32, 36);
    });
  }

  private static generateEnemyTextures(scene: Phaser.Scene): void {
    const size = 24;

    // === THREATS (angular, warm colors, aggressive) ===

    // Malware: Red skull shape
    this.createTexture(scene, 'enemy_malware', size, size, (g) => {
      // Skull head (circle)
      g.fillStyle(0xd9534f, 1);
      g.fillCircle(12, 10, 8);
      // Jaw
      g.fillStyle(0xd9534f, 1);
      g.beginPath();
      g.moveTo(7, 14);
      g.lineTo(7, 18);
      g.lineTo(9, 20);
      g.lineTo(12, 19);
      g.lineTo(15, 20);
      g.lineTo(17, 18);
      g.lineTo(17, 14);
      g.closePath();
      g.fillPath();
      // Eye sockets (dark)
      g.fillStyle(0x000000, 1);
      g.fillCircle(9, 9, 2.5);
      g.fillCircle(15, 9, 2.5);
      // Nose triangle
      g.fillStyle(0x000000, 1);
      g.beginPath();
      g.moveTo(12, 11);
      g.lineTo(10, 14);
      g.lineTo(14, 14);
      g.closePath();
      g.fillPath();
      // Border
      g.lineStyle(1, 0xff6b6b, 1);
      g.strokeCircle(12, 10, 8);
    });

    // DDoS: Small red dot with motion lines
    this.createTexture(scene, 'enemy_ddos', size, size, (g) => {
      // Motion lines behind
      g.lineStyle(2, 0xd9534f, 0.5);
      g.beginPath();
      g.moveTo(3, 10);
      g.lineTo(8, 10);
      g.strokePath();
      g.beginPath();
      g.moveTo(2, 12);
      g.lineTo(7, 12);
      g.strokePath();
      g.beginPath();
      g.moveTo(3, 14);
      g.lineTo(8, 14);
      g.strokePath();
      // Bright red dot
      g.fillStyle(0xff0000, 1);
      g.fillCircle(14, 12, 5);
      // Hot core
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(13, 11, 2);
      // Outer glow
      g.lineStyle(1, 0xff5252, 0.6);
      g.strokeCircle(14, 12, 7);
    });

    // Phishing: Green envelope with red hook
    this.createTexture(scene, 'enemy_phishing', size, size, (g) => {
      // Green envelope body
      g.fillStyle(0x5ea500, 1);
      g.fillRect(4, 8, 16, 11);
      // Envelope flap
      g.fillStyle(0x84bd00, 1);
      g.beginPath();
      g.moveTo(4, 8);
      g.lineTo(12, 14);
      g.lineTo(20, 8);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0x3d7000, 1);
      g.strokeRect(4, 8, 16, 11);
      // Red hook sticking out of corner
      g.lineStyle(2, 0xd9534f, 1);
      g.beginPath();
      g.moveTo(18, 8);
      g.lineTo(20, 5);
      g.arc(18, 4, 2, 0, Math.PI * 1.5, true);
      g.strokePath();
      // Hook barb
      g.fillStyle(0xd9534f, 1);
      g.beginPath();
      g.moveTo(16, 5);
      g.lineTo(15, 3);
      g.lineTo(17, 4);
      g.closePath();
      g.fillPath();
    });

    // SQL Injection: Orange syringe
    this.createTexture(scene, 'enemy_sql_injection', size, size, (g) => {
      // Barrel
      g.fillStyle(0xf47f28, 1);
      g.fillRect(4, 9, 12, 6);
      // Plunger handle
      g.fillStyle(0xffa726, 1);
      g.fillRect(1, 10, 4, 4);
      // Needle tip
      g.fillStyle(0xf47f28, 1);
      g.beginPath();
      g.moveTo(16, 9);
      g.lineTo(22, 12);
      g.lineTo(16, 15);
      g.closePath();
      g.fillPath();
      // Needle point
      g.lineStyle(2, 0xcccccc, 1);
      g.beginPath();
      g.moveTo(21, 12);
      g.lineTo(24, 12);
      g.strokePath();
      // Barrel markings
      g.lineStyle(1, 0xffffff, 0.5);
      g.beginPath();
      g.moveTo(8, 9);
      g.lineTo(8, 15);
      g.strokePath();
      g.beginPath();
      g.moveTo(12, 9);
      g.lineTo(12, 15);
      g.strokePath();
      // Border
      g.lineStyle(1, 0xcc5500, 1);
      g.strokeRect(4, 9, 12, 6);
    });

    // Ransomware C2: Dark red/maroon padlock with skull
    this.createTexture(scene, 'enemy_ransomware_c2', size, size, (g) => {
      // Shackle
      g.lineStyle(3, 0x600000, 1);
      g.beginPath();
      g.arc(12, 8, 5, Math.PI, 0, false);
      g.strokePath();
      // Lock body
      g.fillStyle(0x8b0000, 1);
      g.fillRoundedRect(5, 10, 14, 12, 2);
      g.lineStyle(1, 0xd32f2f, 1);
      g.strokeRoundedRect(5, 10, 14, 12, 2);
      // Mini skull on face
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(12, 14, 3);
      g.fillStyle(0x000000, 1);
      g.fillCircle(10.5, 13.5, 1);
      g.fillCircle(13.5, 13.5, 1);
      g.fillRect(11, 16, 2, 2);
    });

    // Zero-Day: Nearly invisible dashed circle
    this.createTexture(scene, 'enemy_zero_day', size, size, (g) => {
      // Faint dashed circle outline
      g.lineStyle(1, 0x888888, 0.15);
      const cx = 12, cy = 12, r = 9;
      const segments = 12;
      for (let i = 0; i < segments; i += 2) {
        const a1 = (Math.PI * 2 * i) / segments;
        const a2 = (Math.PI * 2 * (i + 1)) / segments;
        g.beginPath();
        g.arc(cx, cy, r, a1, a2, false);
        g.strokePath();
      }
      // Faint question mark
      g.lineStyle(1, 0x666666, 0.15);
      g.beginPath();
      g.arc(12, 10, 3, Math.PI * 1.2, Math.PI * 0.1, false);
      g.strokePath();
      g.fillStyle(0x666666, 0.15);
      g.fillCircle(12, 16, 1);
    });

    this.generateEnemyTexturesPart2(scene, size);
  }

  private static generateEnemyTexturesPart2(scene: Phaser.Scene, size: number): void {
    // === OT THREATS ===

    // Modbus Exploit: Dark orange gear/cog
    this.createTexture(scene, 'enemy_modbus_exploit', size, size, (g) => {
      g.fillStyle(0xcc5500, 1);
      const cx = 12, cy = 12;
      const teeth = 8;
      const outerR = 11, innerR = 7;
      g.beginPath();
      for (let i = 0; i < teeth * 2; i++) {
        const angle = (Math.PI * i) / teeth;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xff8800, 1);
      g.strokePath();
      // Center hole
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(cx, cy, 3);
      // Inner ring detail
      g.lineStyle(1, 0xff8800, 0.5);
      g.strokeCircle(cx, cy, 5);
    });

    // Firmware Worm: Purple segmented worm (3 decreasing circles)
    this.createTexture(scene, 'enemy_firmware_worm', size, size, (g) => {
      // Tail (smallest)
      g.fillStyle(0x5c2d91, 1);
      g.fillCircle(5, 12, 3);
      // Middle segment
      g.fillStyle(0x753bbd, 1);
      g.fillCircle(11, 12, 4);
      // Head (largest)
      g.fillStyle(0x9b59b6, 1);
      g.fillCircle(18, 12, 5);
      // Eyes on head
      g.fillStyle(0xffffff, 1);
      g.fillCircle(17, 10, 1.5);
      g.fillCircle(20, 10, 1.5);
      g.fillStyle(0x000000, 1);
      g.fillCircle(17.5, 10, 0.8);
      g.fillCircle(20.5, 10, 0.8);
      // Segment outlines
      g.lineStyle(1, 0xce93d8, 0.8);
      g.strokeCircle(5, 12, 3);
      g.strokeCircle(11, 12, 4);
      g.strokeCircle(18, 12, 5);
    });

    // Signal Jammer: Yellow lightning bolt with radio waves
    this.createTexture(scene, 'enemy_signal_jammer', size, size, (g) => {
      // Radio wave arcs (left)
      g.lineStyle(2, 0xe7d747, 0.5);
      g.beginPath();
      g.arc(12, 12, 11, Math.PI * 0.6, Math.PI * 1.4, false);
      g.strokePath();
      g.beginPath();
      g.arc(12, 12, 8, Math.PI * 0.7, Math.PI * 1.3, false);
      g.strokePath();
      // Radio wave arcs (right)
      g.beginPath();
      g.arc(12, 12, 11, -Math.PI * 0.4, Math.PI * 0.4, false);
      g.strokePath();
      g.beginPath();
      g.arc(12, 12, 8, -Math.PI * 0.3, Math.PI * 0.3, false);
      g.strokePath();
      // Lightning bolt center
      g.fillStyle(0xe7d747, 1);
      g.beginPath();
      g.moveTo(14, 3);
      g.lineTo(9, 12);
      g.lineTo(13, 12);
      g.lineTo(10, 21);
      g.lineTo(16, 12);
      g.lineTo(12, 12);
      g.lineTo(14, 3);
      g.closePath();
      g.fillPath();
    });

    // === LEGITIMATE TRAFFIC (rounded, cool colors, friendly) ===

    // HTTP Request: Blue rounded rect with "GET" lines
    this.createTexture(scene, 'enemy_http_request', size, size, (g) => {
      g.fillStyle(0x0076a8, 1);
      g.fillRoundedRect(3, 5, 18, 14, 4);
      g.lineStyle(1, 0x48cae4, 1);
      g.strokeRoundedRect(3, 5, 18, 14, 4);
      // "GET" simulated with 3 short lines
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(6, 10);
      g.lineTo(9, 10);
      g.strokePath();
      g.beginPath();
      g.moveTo(10, 10);
      g.lineTo(14, 10);
      g.strokePath();
      g.beginPath();
      g.moveTo(15, 10);
      g.lineTo(18, 10);
      g.strokePath();
      // Underline
      g.lineStyle(1, 0xffffff, 0.4);
      g.beginPath();
      g.moveTo(6, 14);
      g.lineTo(18, 14);
      g.strokePath();
    });

    // DNS Query: Green diamond with "53"
    this.createTexture(scene, 'enemy_dns_query', size, size, (g) => {
      g.fillStyle(0x84bd00, 1);
      g.beginPath();
      g.moveTo(12, 2);
      g.lineTo(22, 12);
      g.lineTo(12, 22);
      g.lineTo(2, 12);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xb8e65e, 1);
      g.strokePath();
      // "53" simulated as two vertical strokes
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(9, 9);
      g.lineTo(9, 11);
      g.lineTo(11, 11);
      g.lineTo(11, 13);
      g.lineTo(9, 13);
      g.strokePath();
      g.beginPath();
      g.moveTo(13, 9);
      g.lineTo(15, 9);
      g.lineTo(15, 11);
      g.lineTo(13, 11);
      g.lineTo(13, 13);
      g.lineTo(15, 13);
      g.strokePath();
    });

    // API Call: Teal curly braces "{ }"
    this.createTexture(scene, 'enemy_api_call', size, size, (g) => {
      g.fillStyle(0x0093b2, 0.3);
      g.fillRoundedRect(2, 4, 20, 16, 4);
      // Left brace
      g.lineStyle(3, 0x0093b2, 1);
      g.beginPath();
      g.moveTo(8, 6);
      g.lineTo(6, 8);
      g.lineTo(5, 12);
      g.lineTo(6, 16);
      g.lineTo(8, 18);
      g.strokePath();
      // Right brace
      g.beginPath();
      g.moveTo(16, 6);
      g.lineTo(18, 8);
      g.lineTo(19, 12);
      g.lineTo(18, 16);
      g.lineTo(16, 18);
      g.strokePath();
      // Center dot
      g.fillStyle(0x4dd0e1, 1);
      g.fillCircle(12, 12, 2);
    });

    // Email: Green envelope
    this.createTexture(scene, 'enemy_email', size, size, (g) => {
      // Envelope body
      g.fillStyle(0x5ea500, 1);
      g.fillRect(4, 8, 16, 11);
      g.lineStyle(1, 0x3d7000, 1);
      g.strokeRect(4, 8, 16, 11);
      // Triangle flap on top
      g.fillStyle(0x84bd00, 1);
      g.beginPath();
      g.moveTo(4, 8);
      g.lineTo(12, 14);
      g.lineTo(20, 8);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0x3d7000, 1);
      g.beginPath();
      g.moveTo(4, 8);
      g.lineTo(12, 14);
      g.lineTo(20, 8);
      g.strokePath();
    });

    this.generateEnemyTexturesPart3(scene, size);
  }

  private static generateEnemyTexturesPart3(scene: Phaser.Scene, size: number): void {
    // === OT LEGITIMATE TRAFFIC ===

    // PLC Heartbeat: Amber EKG pulse line
    this.createTexture(scene, 'enemy_plc_heartbeat', size, size, (g) => {
      // Background pill shape
      g.fillStyle(0xdaa520, 0.2);
      g.fillRoundedRect(2, 6, 20, 12, 6);
      // EKG line
      g.lineStyle(2, 0xdaa520, 1);
      g.beginPath();
      g.moveTo(3, 12);
      g.lineTo(6, 12);
      g.lineTo(8, 6);
      g.lineTo(10, 18);
      g.lineTo(12, 8);
      g.lineTo(14, 14);
      g.lineTo(16, 12);
      g.lineTo(18, 12);
      g.lineTo(21, 12);
      g.strokePath();
      // Subtle glow
      g.lineStyle(1, 0xffb74d, 0.3);
      g.strokeRoundedRect(2, 6, 20, 12, 6);
    });

    // SCADA Telemetry: Gold gauge/dial
    this.createTexture(scene, 'enemy_scada_telemetry', size, size, (g) => {
      // Gauge circle
      g.fillStyle(0xb8860b, 1);
      g.beginPath();
      g.arc(12, 13, 9, Math.PI, 0, false);
      g.lineTo(21, 18);
      g.lineTo(3, 18);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xdaa520, 1);
      g.beginPath();
      g.arc(12, 13, 9, Math.PI, 0, false);
      g.strokePath();
      // Needle
      g.lineStyle(2, 0xffffff, 0.9);
      g.beginPath();
      g.moveTo(12, 13);
      g.lineTo(16, 7);
      g.strokePath();
      // Center dot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(12, 13, 2);
      // Tick marks
      g.lineStyle(1, 0xffffff, 0.5);
      for (let i = 0; i <= 4; i++) {
        const angle = Math.PI + (Math.PI * i) / 4;
        g.beginPath();
        g.moveTo(12 + Math.cos(angle) * 6, 13 + Math.sin(angle) * 6);
        g.lineTo(12 + Math.cos(angle) * 8, 13 + Math.sin(angle) * 8);
        g.strokePath();
      }
    });

    // Track Switch Command: Yellow Y-shape railroad switch
    this.createTexture(scene, 'enemy_track_switch_cmd', size, size, (g) => {
      // Y-shape rail lines
      g.lineStyle(3, 0xe7d747, 1);
      g.beginPath();
      g.moveTo(4, 20);
      g.lineTo(12, 12);
      g.lineTo(12, 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(20, 20);
      g.lineTo(12, 12);
      g.strokePath();
      // Switch lever
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(10, 14);
      g.lineTo(16, 10);
      g.strokePath();
      // Junction point
      g.fillStyle(0xe7d747, 1);
      g.fillCircle(12, 12, 3);
      g.lineStyle(1, 0xffeb3b, 1);
      g.strokeCircle(12, 12, 3);
    });

    // Train Position: Gold diamond with dot in center
    this.createTexture(scene, 'enemy_train_position', size, size, (g) => {
      g.fillStyle(0xdaa520, 1);
      g.beginPath();
      g.moveTo(12, 2);
      g.lineTo(22, 12);
      g.lineTo(12, 22);
      g.lineTo(2, 12);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xffd700, 1);
      g.strokePath();
      // Inner diamond outline
      g.lineStyle(1, 0xffffff, 0.3);
      g.beginPath();
      g.moveTo(12, 5);
      g.lineTo(19, 12);
      g.lineTo(12, 19);
      g.lineTo(5, 12);
      g.closePath();
      g.strokePath();
      // Center dot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(12, 12, 3);
      g.fillStyle(0xdaa520, 1);
      g.fillCircle(12, 12, 1.5);
    });
  }

  private static generateProjectileTextures(scene: Phaser.Scene): void {
    const size = 14;

    // Firewall: Blue-white energy bolt
    this.createTexture(scene, 'projectile_firewall', size, size, (g) => {
      g.fillStyle(0x0076a8, 1);
      g.beginPath();
      g.moveTo(14, 7);
      g.lineTo(8, 3);
      g.lineTo(2, 7);
      g.lineTo(8, 11);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x48cae4, 0.8);
      g.fillCircle(8, 7, 3);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(9, 6, 1.5);
    });

    // IDS: Purple pulse ring
    this.createTexture(scene, 'projectile_ids', size, size, (g) => {
      g.fillStyle(0x753bbd, 0.8);
      g.fillCircle(7, 7, 5);
      g.lineStyle(2, 0xb388ff, 1);
      g.strokeCircle(7, 7, 5);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(7, 7, 2);
    });

    // WAF: Orange energy bolt (larger, glowing)
    this.createTexture(scene, 'projectile_waf', size, size, (g) => {
      g.fillStyle(0xf47f28, 0.3);
      g.fillCircle(7, 7, 6);
      g.fillStyle(0xf47f28, 1);
      g.beginPath();
      g.moveTo(14, 7);
      g.lineTo(8, 2);
      g.lineTo(4, 7);
      g.lineTo(8, 12);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(8, 7, 2);
    });

    // Honeypot: Green sticky blob
    this.createTexture(scene, 'projectile_honeypot', size, size, (g) => {
      g.fillStyle(0xe7d747, 1);
      g.fillCircle(7, 7, 5);
      g.fillStyle(0xffab00, 0.7);
      g.fillCircle(7, 8, 4);
      // Drip
      g.fillStyle(0xe7d747, 0.8);
      g.beginPath();
      g.moveTo(6, 11);
      g.lineTo(8, 11);
      g.lineTo(7, 14);
      g.closePath();
      g.fillPath();
    });

    // Rate Limiter: Teal wave
    this.createTexture(scene, 'projectile_rate_limiter', size, size, (g) => {
      g.lineStyle(3, 0x0093b2, 0.9);
      g.beginPath();
      g.arc(7, 7, 5, -Math.PI * 0.5, Math.PI * 0.5, false);
      g.strokePath();
      g.lineStyle(2, 0x4dd0e1, 0.6);
      g.beginPath();
      g.arc(7, 7, 3, -Math.PI * 0.4, Math.PI * 0.4, false);
      g.strokePath();
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(7, 7, 1.5);
    });

    // Packet Inspector: Green scanning beam
    this.createTexture(scene, 'projectile_packet_inspector', size, size, (g) => {
      g.fillStyle(0x84bd00, 1);
      g.beginPath();
      g.moveTo(14, 7);
      g.lineTo(8, 3);
      g.lineTo(2, 7);
      g.lineTo(8, 11);
      g.closePath();
      g.fillPath();
      // Crosshair in center
      g.lineStyle(1, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(6, 7);
      g.lineTo(10, 7);
      g.moveTo(8, 5);
      g.lineTo(8, 9);
      g.strokePath();
    });

    // Data Diode: Green arrow
    this.createTexture(scene, 'projectile_data_diode', size, size, (g) => {
      g.fillStyle(0x4caf50, 1);
      g.beginPath();
      g.moveTo(2, 5);
      g.lineTo(8, 5);
      g.lineTo(8, 2);
      g.lineTo(14, 7);
      g.lineTo(8, 12);
      g.lineTo(8, 9);
      g.lineTo(2, 9);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(7, 7, 2);
    });

    // Network Segmentation: Yellow barrier flash
    this.createTexture(scene, 'projectile_network_segmentation', size, size, (g) => {
      g.fillStyle(0xe7d747, 1);
      g.fillRect(3, 4, 8, 6);
      g.lineStyle(2, 0x000000, 0.5);
      g.beginPath();
      g.moveTo(5, 4);
      g.lineTo(7, 10);
      g.moveTo(9, 4);
      g.lineTo(11, 10);
      g.strokePath();
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(7, 7, 1.5);
    });
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

    // Range circle
    this.createTexture(scene, 'ui_range_circle', 64, 64, (g) => {
      g.fillStyle(0x0076a8, 0.1);
      g.fillCircle(32, 32, 30);
      g.lineStyle(1, 0x0076a8, 0.3);
      g.strokeCircle(32, 32, 30);
    });
  }

  private static generateEffectTextures(scene: Phaser.Scene): void {
    // Particle dot (small white circle for effects)
    this.createTexture(scene, 'particle_dot', 8, 8, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 3);
    });

    // Muzzle flash
    this.createTexture(scene, 'muzzle_flash', 16, 16, (g) => {
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(8, 8, 6);
      g.fillStyle(0xffff00, 0.4);
      g.fillCircle(8, 8, 8);
    });

    // Hit ring
    this.createTexture(scene, 'hit_ring', 24, 24, (g) => {
      g.lineStyle(2, 0xffffff, 1);
      g.strokeCircle(12, 12, 10);
    });

    // Red X mark (for false positives)
    this.createTexture(scene, 'false_positive_x', 32, 32, (g) => {
      g.lineStyle(4, 0xd9534f, 1);
      g.beginPath();
      g.moveTo(6, 6);
      g.lineTo(26, 26);
      g.strokePath();
      g.beginPath();
      g.moveTo(26, 6);
      g.lineTo(6, 26);
      g.strokePath();
    });

    // Beam effect texture (for firewall/packet inspector beam attacks)
    this.createTexture(scene, 'beam_particle', 4, 4, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(2, 2, 2);
    });

    // Trail particle (larger, for projectile trails)
    this.createTexture(scene, 'trail_particle', 10, 10, (g) => {
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(5, 5, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(5, 5, 5);
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
