export class AssetGenerator {
  static generate(scene: Phaser.Scene): void {
    this.generateTowerTextures(scene);
    this.generateEnemyTextures(scene);
    this.generateProjectileTextures(scene);
    this.generateUITextures(scene);
    this.generateEffectTextures(scene);
  }

  private static generateTowerTextures(scene: Phaser.Scene): void {
    const s = 32;

    // Firewall: Server rack rectangle with 3 LED dots
    this.createTexture(scene, 'tower_firewall', s, s, (g) => {
      // Rack body
      g.fillStyle(0x0076a8, 1);
      g.fillRect(6, 4, 20, 24);
      // Solid border
      g.lineStyle(2, 0x044872, 1);
      g.strokeRect(6, 4, 20, 24);
      // 3 horizontal LED dots (green)
      g.fillStyle(0x84bd00, 1);
      g.fillCircle(12, 14, 2);
      g.fillCircle(16, 14, 2);
      g.fillCircle(20, 14, 2);
      // Rack lines
      g.lineStyle(1, 0x044872, 0.6);
      g.beginPath();
      g.moveTo(8, 10);
      g.lineTo(24, 10);
      g.strokePath();
      g.beginPath();
      g.moveTo(8, 18);
      g.lineTo(24, 18);
      g.strokePath();
      g.beginPath();
      g.moveTo(8, 22);
      g.lineTo(24, 22);
      g.strokePath();
    });

    // IDS: Circular radar/monitoring screen with sweep line and blips
    this.createTexture(scene, 'tower_ids', s, s, (g) => {
      const cx = 16, cy = 16;
      // Radar screen circle
      g.fillStyle(0x753bbd, 1);
      g.fillCircle(cx, cy, 13);
      g.lineStyle(2, 0xb388ff, 1);
      g.strokeCircle(cx, cy, 13);
      // Inner grid rings
      g.lineStyle(1, 0xb388ff, 0.3);
      g.strokeCircle(cx, cy, 6);
      g.strokeCircle(cx, cy, 10);
      // Sweep line (fixed position)
      g.lineStyle(2, 0x00ff88, 0.9);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(-0.5) * 12, cy + Math.sin(-0.5) * 12);
      g.strokePath();
      // Green dot blips
      g.fillStyle(0x00ff88, 1);
      g.fillCircle(cx + 4, cy - 5, 1.5);
      g.fillCircle(cx - 3, cy + 6, 1.5);
      g.fillCircle(cx + 7, cy + 2, 1);
    });

    // WAF: Shield-shaped panel with small screen showing "WAF"
    this.createTexture(scene, 'tower_waf', s, s, (g) => {
      // Shield shape
      g.fillStyle(0xf47f28, 1);
      g.beginPath();
      g.moveTo(16, 2);
      g.lineTo(28, 8);
      g.lineTo(28, 20);
      g.lineTo(16, 30);
      g.lineTo(4, 20);
      g.lineTo(4, 8);
      g.closePath();
      g.fillPath();
      // Border
      g.lineStyle(2, 0xc45a10, 1);
      g.beginPath();
      g.moveTo(16, 2);
      g.lineTo(28, 8);
      g.lineTo(28, 20);
      g.lineTo(16, 30);
      g.lineTo(4, 20);
      g.lineTo(4, 8);
      g.closePath();
      g.strokePath();
      // Small screen/display in center
      g.fillStyle(0x0a1628, 1);
      g.fillRect(10, 12, 12, 8);
      g.lineStyle(1, 0xffffff, 0.6);
      g.strokeRect(10, 12, 12, 8);
      // "WAF" as tiny lines (simulated text)
      g.lineStyle(1, 0x84bd00, 1);
      // W
      g.beginPath();
      g.moveTo(12, 14);
      g.lineTo(13, 18);
      g.lineTo(14, 16);
      g.lineTo(15, 18);
      g.lineTo(16, 14);
      g.strokePath();
      // A
      g.beginPath();
      g.moveTo(17, 18);
      g.lineTo(18, 14);
      g.lineTo(19, 18);
      g.strokePath();
      // F
      g.beginPath();
      g.moveTo(20, 18);
      g.lineTo(20, 14);
      g.lineTo(22, 14);
      g.strokePath();
      g.beginPath();
      g.moveTo(20, 16);
      g.lineTo(21, 16);
      g.strokePath();
    });

    // Honeypot: Container/box with wifi/signal icon, slightly tilted
    this.createTexture(scene, 'tower_honeypot', s, s, (g) => {
      // Slightly tilted box (use transform via skewed rect)
      g.fillStyle(0xe7d747, 1);
      g.beginPath();
      g.moveTo(5, 8);
      g.lineTo(27, 6);
      g.lineTo(28, 26);
      g.lineTo(6, 28);
      g.closePath();
      g.fillPath();
      // Border
      g.lineStyle(2, 0xa89000, 1);
      g.beginPath();
      g.moveTo(5, 8);
      g.lineTo(27, 6);
      g.lineTo(28, 26);
      g.lineTo(6, 28);
      g.closePath();
      g.strokePath();
      // Wifi/signal arcs (deceptive AP)
      g.lineStyle(2, 0x1a1a1a, 0.8);
      g.beginPath();
      g.arc(16, 20, 4, Math.PI + 0.5, -0.5, false);
      g.strokePath();
      g.lineStyle(2, 0x1a1a1a, 0.6);
      g.beginPath();
      g.arc(16, 20, 7, Math.PI + 0.6, -0.6, false);
      g.strokePath();
      // Center dot
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(16, 20, 1.5);
    });

    this.generateTowerTexturesPart2(scene, s, s);
  }

  private static generateTowerTexturesPart2(scene: Phaser.Scene, _w: number, _h: number): void {
    const s = 32;

    // Rate Limiter: Traffic light — vertical rectangle with 3 circles (red/yellow/green)
    this.createTexture(scene, 'tower_rate_limiter', s, s, (g) => {
      // Vertical rectangle body
      g.fillStyle(0x0093b2, 1);
      g.fillRect(10, 2, 12, 28);
      // Border
      g.lineStyle(2, 0x044872, 1);
      g.strokeRect(10, 2, 12, 28);
      // Red circle (top)
      g.fillStyle(0xd9534f, 1);
      g.fillCircle(16, 8, 3);
      // Yellow circle (middle)
      g.fillStyle(0xe7d747, 1);
      g.fillCircle(16, 16, 3);
      // Green circle (bottom)
      g.fillStyle(0x84bd00, 1);
      g.fillCircle(16, 24, 3);
    });

    // Packet Inspector: Camera/lens shape — concentric circles + mounting arm
    this.createTexture(scene, 'tower_packet_inspector', s, s, (g) => {
      const cx = 14, cy = 14;
      // Outer circle (lens)
      g.fillStyle(0x84bd00, 1);
      g.fillCircle(cx, cy, 10);
      g.lineStyle(2, 0x5ea500, 1);
      g.strokeCircle(cx, cy, 10);
      // Inner concentric circle
      g.fillStyle(0x0a1628, 1);
      g.fillCircle(cx, cy, 5);
      g.lineStyle(1, 0x84bd00, 0.8);
      g.strokeCircle(cx, cy, 5);
      // Lens highlight
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(cx - 3, cy - 3, 2);
      // Mounting arm (line extending down-right)
      g.lineStyle(3, 0x5ea500, 1);
      g.beginPath();
      g.moveTo(cx + 7, cy + 7);
      g.lineTo(28, 28);
      g.strokePath();
      // Mount base
      g.fillStyle(0x3d7000, 1);
      g.fillCircle(28, 28, 3);
    });

    // Data Diode: Rectangle split in half with arrow pointing right
    this.createTexture(scene, 'tower_data_diode', s, s, (g) => {
      // Left half (dark)
      g.fillStyle(0x1a1a1a, 1);
      g.fillRect(4, 6, 12, 20);
      // Right half (green)
      g.fillStyle(0x84bd00, 1);
      g.fillRect(16, 6, 12, 20);
      // Border
      g.lineStyle(1, 0x484848, 1);
      g.strokeRect(4, 6, 24, 20);
      // Arrow pointing right (white)
      g.fillStyle(0xffffff, 1);
      g.beginPath();
      g.moveTo(10, 13);
      g.lineTo(18, 13);
      g.lineTo(18, 10);
      g.lineTo(24, 16);
      g.lineTo(18, 22);
      g.lineTo(18, 19);
      g.lineTo(10, 19);
      g.closePath();
      g.fillPath();
    });

    // Network Segmentation: Vertical barrier with horizontal dashes
    this.createTexture(scene, 'tower_network_segmentation', s, s, (g) => {
      // Vertical barrier line (yellow)
      g.lineStyle(4, 0xe7d747, 1);
      g.beginPath();
      g.moveTo(16, 2);
      g.lineTo(16, 30);
      g.strokePath();
      // Horizontal dashes on left side (black)
      g.lineStyle(2, 0x1a1a1a, 1);
      for (let i = 0; i < 5; i++) {
        const y = 5 + i * 6;
        g.beginPath();
        g.moveTo(4, y);
        g.lineTo(12, y);
        g.strokePath();
      }
      // Horizontal dashes on right side (black)
      for (let i = 0; i < 5; i++) {
        const y = 5 + i * 6;
        g.beginPath();
        g.moveTo(20, y);
        g.lineTo(28, y);
        g.strokePath();
      }
      // Small yellow dots at intersections
      g.fillStyle(0xe7d747, 0.6);
      g.fillCircle(16, 8, 1.5);
      g.fillCircle(16, 16, 1.5);
      g.fillCircle(16, 24, 1.5);
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
