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

    // === THREATS (train-car blocks, warm colors, angular) ===

    // Malware: 3 connected red rectangular cars (7x5px each, 1px gap)
    this.createTexture(scene, 'enemy_malware', size, size, (g) => {
      const color = 0xd9534f;
      const highlight = 0xe8706b;
      const carW = 7, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 3; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        // Top edge highlight for 3D depth
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
    });

    // DDoS: Single tiny red square (5x5) — swarms make many appear
    this.createTexture(scene, 'enemy_ddos', size, size, (g) => {
      const color = 0xd9534f;
      const highlight = 0xe8706b;
      g.fillStyle(color, 1);
      g.fillRect(10, 10, 5, 5);
      g.lineStyle(1, highlight, 1);
      g.beginPath();
      g.moveTo(10, 10);
      g.lineTo(15, 10);
      g.strokePath();
    });

    // Phishing: 3 green cars identical to email — last car has subtle red dot
    this.createTexture(scene, 'enemy_phishing', size, size, (g) => {
      const color = 0x5ea500;
      const highlight = 0x7cc620;
      const carW = 7, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 3; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
      // Subtle red dot on last car (hard to spot)
      const lastCarX = startX + 2 * (carW + gap);
      g.fillStyle(0xd9534f, 0.7);
      g.fillCircle(lastCarX + carW - 2, startY + carH - 2, 1);
    });

    // SQL Injection: 2 orange cars with pointed front (wedge on first car)
    this.createTexture(scene, 'enemy_sql_injection', size, size, (g) => {
      const color = 0xf47f28;
      const highlight = 0xffa050;
      const carW = 9, carH = 5, gap = 1;
      const startX = 2, startY = 10;
      // First car: wedge/pointed front
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(startX + 3, startY);
      g.lineTo(startX + carW, startY);
      g.lineTo(startX + carW, startY + carH);
      g.lineTo(startX + 3, startY + carH);
      g.lineTo(startX, startY + Math.floor(carH / 2));
      g.closePath();
      g.fillPath();
      g.lineStyle(1, highlight, 1);
      g.beginPath();
      g.moveTo(startX + 3, startY);
      g.lineTo(startX + carW, startY);
      g.strokePath();
      // Second car: regular rectangle
      const x2 = startX + carW + gap;
      g.fillStyle(color, 1);
      g.fillRect(x2, startY, carW, carH);
      g.lineStyle(1, highlight, 1);
      g.beginPath();
      g.moveTo(x2, startY);
      g.lineTo(x2 + carW, startY);
      g.strokePath();
    });

    // Ransomware C2: 4 dark maroon cars with padlock icon on lead car
    this.createTexture(scene, 'enemy_ransomware_c2', size, size, (g) => {
      const color = 0x8b0000;
      const highlight = 0xb30000;
      const carW = 5, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 4; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
      // Padlock icon on lead car
      const lx = startX + 1;
      g.lineStyle(1, 0xffffff, 0.8);
      g.beginPath();
      g.arc(lx + 2, startY + 1, 1.5, Math.PI, 0, false);
      g.strokePath();
      g.fillStyle(0xffffff, 0.8);
      g.fillRect(lx + 0.5, startY + 1, 3, 2.5);
    });

    // Zero-Day: 2 cars with dashed outlines only, no fill, 0.2 alpha
    this.createTexture(scene, 'enemy_zero_day', size, size, (g) => {
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        // Dashed outline (draw segments)
        g.lineStyle(1, 0x888888, 0.2);
        const dashLen = 2, gapLen = 2;
        // Top edge dashes
        for (let d = 0; d < carW; d += dashLen + gapLen) {
          g.beginPath();
          g.moveTo(x + d, startY);
          g.lineTo(x + Math.min(d + dashLen, carW), startY);
          g.strokePath();
        }
        // Bottom edge dashes
        for (let d = 0; d < carW; d += dashLen + gapLen) {
          g.beginPath();
          g.moveTo(x + d, startY + carH);
          g.lineTo(x + Math.min(d + dashLen, carW), startY + carH);
          g.strokePath();
        }
        // Left edge
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x, startY + carH);
        g.strokePath();
        // Right edge
        g.beginPath();
        g.moveTo(x + carW, startY);
        g.lineTo(x + carW, startY + carH);
        g.strokePath();
      }
    });

    this.generateEnemyTexturesPart2(scene, size);
  }

  private static generateEnemyTexturesPart2(scene: Phaser.Scene, size: number): void {
    // === OT THREATS (train-car blocks) ===

    // Modbus Exploit: 3 dark amber cars with gear icon on lead car
    this.createTexture(scene, 'enemy_modbus_exploit', size, size, (g) => {
      const color = 0xb8860b;
      const highlight = 0xdaa520;
      const carW = 7, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 3; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
      // Gear icon on lead car (small cross + circle)
      const gx = startX + 3, gy = startY + 2;
      g.lineStyle(1, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(gx - 1, gy);
      g.lineTo(gx + 1, gy);
      g.strokePath();
      g.beginPath();
      g.moveTo(gx, gy - 1);
      g.lineTo(gx, gy + 1);
      g.strokePath();
      g.strokeCircle(gx, gy, 1.5);
    });

    // Firmware Worm: 4 purple cars, each slightly smaller (tapered)
    this.createTexture(scene, 'enemy_firmware_worm', size, size, (g) => {
      const color = 0x753bbd;
      const highlight = 0x9b59b6;
      const gap = 1;
      const startY = 10;
      // Cars: 7x5, 6x5, 5x5, 4x5 (tapered)
      const widths = [7, 6, 5, 4];
      let x = 0;
      for (let i = 0; i < 4; i++) {
        const cw = widths[i];
        const yOffset = Math.floor((5 - cw + widths[0]) / 2);
        g.fillStyle(color, 1);
        g.fillRect(x, startY + (i * 0.5), cw, 5);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY + (i * 0.5));
        g.lineTo(x + cw, startY + (i * 0.5));
        g.strokePath();
        x += cw + gap;
      }
    });

    // Signal Jammer: 2 yellow cars with lightning bolt lines radiating
    this.createTexture(scene, 'enemy_signal_jammer', size, size, (g) => {
      const color = 0xe7d747;
      const highlight = 0xffeb3b;
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
      // Lightning bolt lines radiating from cars
      g.lineStyle(1, 0xffeb3b, 0.8);
      g.beginPath();
      g.moveTo(6, startY - 1);
      g.lineTo(4, startY - 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(12, startY - 1);
      g.lineTo(12, startY - 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(18, startY - 1);
      g.lineTo(20, startY - 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(6, startY + carH + 1);
      g.lineTo(4, startY + carH + 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(18, startY + carH + 1);
      g.lineTo(20, startY + carH + 4);
      g.strokePath();
    });

    // === LEGITIMATE TRAFFIC (train-car blocks, cool colors, smooth) ===

    // HTTP Request: 2 blue cars, clean and uniform
    this.createTexture(scene, 'enemy_http_request', size, size, (g) => {
      const color = 0x0076a8;
      const highlight = 0x48cae4;
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
    });

    // DNS Query: 1 green car with "53" simulated (two short lines)
    this.createTexture(scene, 'enemy_dns_query', size, size, (g) => {
      const color = 0x84bd00;
      const highlight = 0xb8e65e;
      const carW = 14, carH = 5;
      const startX = 5, startY = 10;
      g.fillStyle(color, 1);
      g.fillRect(startX, startY, carW, carH);
      g.lineStyle(1, highlight, 1);
      g.beginPath();
      g.moveTo(startX, startY);
      g.lineTo(startX + carW, startY);
      g.strokePath();
      // "53" simulated with two short lines
      g.lineStyle(1, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(startX + 3, startY + 2);
      g.lineTo(startX + 5, startY + 2);
      g.strokePath();
      g.beginPath();
      g.moveTo(startX + 7, startY + 2);
      g.lineTo(startX + 9, startY + 2);
      g.strokePath();
    });

    // API Call: 2 teal cars with curly-brace lines on first car
    this.createTexture(scene, 'enemy_api_call', size, size, (g) => {
      const color = 0x0093b2;
      const highlight = 0x4dd0e1;
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
      // Curly-brace lines on first car
      g.lineStyle(1, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(startX + 2, startY + 1);
      g.lineTo(startX + 1, startY + 2.5);
      g.lineTo(startX + 2, startY + 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(startX + 8, startY + 1);
      g.lineTo(startX + 9, startY + 2.5);
      g.lineTo(startX + 8, startY + 4);
      g.strokePath();
    });

    // Email: 2 green cars, smooth edges, white stripe
    this.createTexture(scene, 'enemy_email', size, size, (g) => {
      const color = 0x5ea500;
      const highlight = 0x7cc620;
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
        // White stripe through middle
        g.lineStyle(1, 0xffffff, 0.5);
        g.beginPath();
        g.moveTo(x + 1, startY + 2.5);
        g.lineTo(x + carW - 1, startY + 2.5);
        g.strokePath();
      }
    });

    this.generateEnemyTexturesPart3(scene, size);
  }

  private static generateEnemyTexturesPart3(scene: Phaser.Scene, size: number): void {
    // === OT LEGITIMATE TRAFFIC (train-car blocks) ===

    // PLC Heartbeat: 2 amber cars with pulse line on first car
    this.createTexture(scene, 'enemy_plc_heartbeat', size, size, (g) => {
      const color = 0xdaa520;
      const highlight = 0xffb74d;
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRect(x, startY, carW, carH);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x, startY);
        g.lineTo(x + carW, startY);
        g.strokePath();
      }
      // Pulse line on first car
      g.lineStyle(1, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(startX + 1, startY + 3);
      g.lineTo(startX + 3, startY + 3);
      g.lineTo(startX + 4, startY + 1);
      g.lineTo(startX + 5, startY + 4);
      g.lineTo(startX + 6, startY + 2);
      g.lineTo(startX + 8, startY + 3);
      g.strokePath();
    });

    // SCADA Telemetry: 2 gold cars, rounded, with dial marks
    this.createTexture(scene, 'enemy_scada_telemetry', size, size, (g) => {
      const color = 0xb8860b;
      const highlight = 0xdaa520;
      const carW = 10, carH = 5, gap = 1;
      const startX = 1, startY = 10;
      for (let i = 0; i < 2; i++) {
        const x = startX + i * (carW + gap);
        g.fillStyle(color, 1);
        g.fillRoundedRect(x, startY, carW, carH, 1);
        g.lineStyle(1, highlight, 1);
        g.beginPath();
        g.moveTo(x + 1, startY);
        g.lineTo(x + carW - 1, startY);
        g.strokePath();
      }
      // Dial marks on first car (small ticks)
      g.lineStyle(1, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(startX + 3, startY + 1);
      g.lineTo(startX + 3, startY + 2);
      g.strokePath();
      g.beginPath();
      g.moveTo(startX + 5, startY + 1);
      g.lineTo(startX + 5, startY + 2);
      g.strokePath();
      g.beginPath();
      g.moveTo(startX + 7, startY + 1);
      g.lineTo(startX + 7, startY + 2);
      g.strokePath();
    });

    // Track Switch Command: 1 yellow car with Y-shape line
    this.createTexture(scene, 'enemy_track_switch_cmd', size, size, (g) => {
      const color = 0xe7d747;
      const highlight = 0xffeb3b;
      const carW = 14, carH = 5;
      const startX = 5, startY = 10;
      g.fillStyle(color, 1);
      g.fillRect(startX, startY, carW, carH);
      g.lineStyle(1, highlight, 1);
      g.beginPath();
      g.moveTo(startX, startY);
      g.lineTo(startX + carW, startY);
      g.strokePath();
      // Y-shape line on car
      g.lineStyle(1, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(startX + 4, startY + 1);
      g.lineTo(startX + 7, startY + 3);
      g.lineTo(startX + 7, startY + 4);
      g.strokePath();
      g.beginPath();
      g.moveTo(startX + 10, startY + 1);
      g.lineTo(startX + 7, startY + 3);
      g.strokePath();
    });

    // Train Position: 1 gold diamond-shaped car (small, fast)
    this.createTexture(scene, 'enemy_train_position', size, size, (g) => {
      const color = 0xdaa520;
      const highlight = 0xffd700;
      // Diamond shape
      g.fillStyle(color, 1);
      g.beginPath();
      g.moveTo(12, 7);
      g.lineTo(19, 12);
      g.lineTo(12, 17);
      g.lineTo(5, 12);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, highlight, 1);
      g.beginPath();
      g.moveTo(12, 7);
      g.lineTo(19, 12);
      g.lineTo(12, 17);
      g.lineTo(5, 12);
      g.closePath();
      g.strokePath();
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
