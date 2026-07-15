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

    // Firewall: Blue shield/wall with 3 horizontal rule lines
    this.createTexture(scene, 'tower_firewall', w, h, (g) => {
      // Shield body
      g.fillStyle(0x0076a8, 1);
      g.beginPath();
      g.moveTo(20, 2);
      g.lineTo(36, 10);
      g.lineTo(36, 30);
      g.lineTo(20, 44);
      g.lineTo(4, 30);
      g.lineTo(4, 10);
      g.closePath();
      g.fillPath();
      // Border
      g.lineStyle(2, 0x48cae4, 1);
      g.strokePath();
      // 3 horizontal rule lines
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(10, 18);
      g.lineTo(30, 18);
      g.strokePath();
      g.beginPath();
      g.moveTo(10, 26);
      g.lineTo(30, 26);
      g.strokePath();
      g.beginPath();
      g.moveTo(12, 34);
      g.lineTo(28, 34);
      g.strokePath();
    });

    // IDS: Purple circle with radar sweep arc
    this.createTexture(scene, 'tower_ids', w, h, (g) => {
      // Outer circle
      g.fillStyle(0x753bbd, 1);
      g.fillCircle(20, 24, 18);
      g.lineStyle(2, 0xb388ff, 1);
      g.strokeCircle(20, 24, 18);
      // Inner ring
      g.lineStyle(1, 0xce93d8, 0.5);
      g.strokeCircle(20, 24, 12);
      g.strokeCircle(20, 24, 6);
      // Radar sweep line
      g.lineStyle(2, 0x00ff88, 0.9);
      g.beginPath();
      g.moveTo(20, 24);
      g.lineTo(34, 14);
      g.strokePath();
      // Sweep arc (filled wedge)
      g.fillStyle(0x00ff88, 0.2);
      g.beginPath();
      g.moveTo(20, 24);
      g.arc(20, 24, 16, -0.9, -0.3, false);
      g.closePath();
      g.fillPath();
      // Center dot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(20, 24, 2);
    });

    // WAF: Orange hexagonal shield
    this.createTexture(scene, 'tower_waf', w, h, (g) => {
      g.fillStyle(0xf47f28, 1);
      // Hexagon
      const cx = 20;
      const cy = 24;
      const r = 18;
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      g.lineStyle(2, 0xffb74d, 1);
      g.strokePath();
      // Inner hexagon
      g.lineStyle(1, 0xffffff, 0.5);
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = cx + 10 * Math.cos(angle);
        const py = cy + 10 * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.strokePath();
      // W letter
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(12, 20);
      g.lineTo(15, 30);
      g.lineTo(20, 24);
      g.lineTo(25, 30);
      g.lineTo(28, 20);
      g.strokePath();
    });

    // Honeypot: Yellow jar with honey drip
    this.createTexture(scene, 'tower_honeypot', w, h, (g) => {
      // Jar body
      g.fillStyle(0xe7d747, 1);
      g.beginPath();
      g.moveTo(10, 18);
      g.lineTo(8, 42);
      g.lineTo(32, 42);
      g.lineTo(30, 18);
      g.closePath();
      g.fillPath();
      // Jar rim
      g.fillStyle(0xffd54f, 1);
      g.fillRect(8, 14, 24, 6);
      // Jar border
      g.lineStyle(2, 0xc9b100, 1);
      g.beginPath();
      g.moveTo(10, 18);
      g.lineTo(8, 42);
      g.lineTo(32, 42);
      g.lineTo(30, 18);
      g.closePath();
      g.strokePath();
      g.strokeRect(8, 14, 24, 6);
      // Honey drip left
      g.fillStyle(0xffab00, 1);
      g.beginPath();
      g.moveTo(12, 14);
      g.lineTo(14, 14);
      g.lineTo(14, 10);
      g.arc(13, 10, 1.5, 0, Math.PI * 2);
      g.fillPath();
      // Honey drip right
      g.beginPath();
      g.moveTo(26, 14);
      g.lineTo(28, 14);
      g.lineTo(28, 8);
      g.arc(27, 8, 2, 0, Math.PI * 2);
      g.fillPath();
      // Label H
      g.lineStyle(2, 0x8b6914, 0.8);
      g.beginPath();
      g.moveTo(16, 26);
      g.lineTo(16, 36);
      g.moveTo(24, 26);
      g.lineTo(24, 36);
      g.moveTo(16, 31);
      g.lineTo(24, 31);
      g.strokePath();
    });

    // Rate Limiter: Teal gauge/meter with needle
    this.createTexture(scene, 'tower_rate_limiter', w, h, (g) => {
      // Gauge body (semicircle base)
      g.fillStyle(0x0093b2, 1);
      g.beginPath();
      g.arc(20, 28, 18, Math.PI, 0, false);
      g.lineTo(38, 44);
      g.lineTo(2, 44);
      g.closePath();
      g.fillPath();
      g.lineStyle(2, 0x4dd0e1, 1);
      g.beginPath();
      g.arc(20, 28, 18, Math.PI, 0, false);
      g.strokePath();
      // Gauge arc markings
      g.lineStyle(2, 0xffffff, 0.6);
      g.beginPath();
      g.arc(20, 28, 13, Math.PI, 0, false);
      g.strokePath();
      // Tick marks
      for (let i = 0; i <= 4; i++) {
        const angle = Math.PI + (Math.PI * i) / 4;
        g.lineStyle(2, 0xffffff, 0.8);
        g.beginPath();
        g.moveTo(20 + Math.cos(angle) * 11, 28 + Math.sin(angle) * 11);
        g.lineTo(20 + Math.cos(angle) * 15, 28 + Math.sin(angle) * 15);
        g.strokePath();
      }
      // Needle (pointing toward high/danger zone)
      g.lineStyle(3, 0xd9534f, 1);
      g.beginPath();
      g.moveTo(20, 28);
      const needleAngle = Math.PI + Math.PI * 0.7;
      g.lineTo(20 + Math.cos(needleAngle) * 12, 28 + Math.sin(needleAngle) * 12);
      g.strokePath();
      // Center dot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(20, 28, 3);
    });

    // Packet Inspector: Green magnifying glass
    this.createTexture(scene, 'tower_packet_inspector', w, h, (g) => {
      // Lens circle
      g.fillStyle(0x84bd00, 0.25);
      g.fillCircle(17, 18, 14);
      g.lineStyle(3, 0x84bd00, 1);
      g.strokeCircle(17, 18, 14);
      // Handle
      g.lineStyle(5, 0x5ea500, 1);
      g.beginPath();
      g.moveTo(27, 28);
      g.lineTo(36, 42);
      g.strokePath();
      // Handle grip
      g.lineStyle(3, 0x3d7000, 1);
      g.beginPath();
      g.moveTo(34, 40);
      g.lineTo(38, 44);
      g.strokePath();
      // Lens glare
      g.lineStyle(2, 0xffffff, 0.5);
      g.beginPath();
      g.arc(12, 13, 6, Math.PI * 1.1, Math.PI * 1.6, false);
      g.strokePath();
      // Inner detail: binary
      g.lineStyle(1, 0xffffff, 0.4);
      g.beginPath();
      g.moveTo(11, 18);
      g.lineTo(23, 18);
      g.strokePath();
      g.beginPath();
      g.moveTo(13, 22);
      g.lineTo(21, 22);
      g.strokePath();
    });

    // Data Diode: Dark green arrow pointing one direction (one-way)
    this.createTexture(scene, 'tower_data_diode', w, h, (g) => {
      // Body rectangle
      g.fillStyle(0x1b5e20, 1);
      g.fillRect(6, 12, 28, 24);
      g.lineStyle(2, 0x4caf50, 1);
      g.strokeRect(6, 12, 28, 24);
      // Arrow pointing right (one-way)
      g.fillStyle(0x84bd00, 1);
      g.beginPath();
      g.moveTo(12, 20);
      g.lineTo(26, 20);
      g.lineTo(26, 16);
      g.lineTo(34, 24);
      g.lineTo(26, 32);
      g.lineTo(26, 28);
      g.lineTo(12, 28);
      g.closePath();
      g.fillPath();
      // Blocked arrow (left side, red X)
      g.lineStyle(2, 0xd9534f, 0.7);
      g.beginPath();
      g.moveTo(8, 38);
      g.lineTo(14, 44);
      g.moveTo(14, 38);
      g.lineTo(8, 44);
      g.strokePath();
    });

    // Network Segmentation: Split rectangle with divider line (boundary)
    this.createTexture(scene, 'tower_network_segmentation', w, h, (g) => {
      // Left half (IT side - blue)
      g.fillStyle(0x0076a8, 0.8);
      g.fillRect(4, 8, 15, 32);
      g.lineStyle(1, 0x48cae4, 1);
      g.strokeRect(4, 8, 15, 32);
      // Right half (OT side - orange)
      g.fillStyle(0xf47f28, 0.8);
      g.fillRect(21, 8, 15, 32);
      g.lineStyle(1, 0xffb74d, 1);
      g.strokeRect(21, 8, 15, 32);
      // Divider line (thick, hazard-style)
      g.lineStyle(3, 0xe7d747, 1);
      g.beginPath();
      g.moveTo(20, 6);
      g.lineTo(20, 42);
      g.strokePath();
      // Dashes on divider
      g.lineStyle(2, 0x000000, 0.6);
      g.beginPath();
      g.moveTo(20, 10);
      g.lineTo(20, 14);
      g.strokePath();
      g.beginPath();
      g.moveTo(20, 20);
      g.lineTo(20, 24);
      g.strokePath();
      g.beginPath();
      g.moveTo(20, 30);
      g.lineTo(20, 34);
      g.strokePath();
      // IT label
      g.lineStyle(1, 0xffffff, 0.6);
      g.beginPath();
      g.moveTo(9, 20);
      g.lineTo(9, 28);
      g.strokePath();
      // OT label
      g.beginPath();
      g.moveTo(28, 20);
      g.lineTo(28, 28);
      g.strokePath();
    });
  }

  private static generateEnemyTextures(scene: Phaser.Scene): void {
    const size = 24;

    // === THREATS (angular, warm colors) ===

    // Malware: Red irregular star/burst
    this.createTexture(scene, 'enemy_malware', size, size, (g) => {
      g.fillStyle(0xd9534f, 1);
      g.beginPath();
      const cx = 12;
      const cy = 12;
      const spikes = 7;
      const outerR = 11;
      const innerR = 5;
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xff6b6b, 1);
      g.strokePath();
    });

    // DDoS: Small red circle (tiny, comes in swarms)
    this.createTexture(scene, 'enemy_ddos', size, size, (g) => {
      g.fillStyle(0xd9534f, 1);
      g.fillCircle(12, 12, 6);
      g.lineStyle(1, 0xff8a80, 0.8);
      g.strokeCircle(12, 12, 6);
      // Small pulse ring
      g.lineStyle(1, 0xff5252, 0.4);
      g.strokeCircle(12, 12, 9);
    });

    // Phishing: Green circle with red tint (mimics legit but slightly off)
    this.createTexture(scene, 'enemy_phishing', size, size, (g) => {
      // Base: looks like legitimate HTTP
      g.fillStyle(0x66bb6a, 1);
      g.fillCircle(12, 12, 10);
      g.lineStyle(1, 0xa5d6a7, 1);
      g.strokeCircle(12, 12, 10);
      // Subtle red shimmer/tint overlay
      g.fillStyle(0xd9534f, 0.25);
      g.fillCircle(12, 12, 10);
      // Hook symbol (subtle)
      g.lineStyle(2, 0xd9534f, 0.6);
      g.beginPath();
      g.arc(14, 10, 4, Math.PI * 0.5, Math.PI * 1.5, false);
      g.lineTo(14, 18);
      g.strokePath();
    });

    // SQL Injection: Orange syringe/pointed shape
    this.createTexture(scene, 'enemy_sql_injection', size, size, (g) => {
      g.fillStyle(0xf47f28, 1);
      // Syringe body
      g.beginPath();
      g.moveTo(4, 10);
      g.lineTo(18, 10);
      g.lineTo(18, 14);
      g.lineTo(4, 14);
      g.closePath();
      g.fillPath();
      // Needle point
      g.beginPath();
      g.moveTo(18, 9);
      g.lineTo(23, 12);
      g.lineTo(18, 15);
      g.closePath();
      g.fillPath();
      // Plunger
      g.fillStyle(0xffa726, 1);
      g.fillRect(1, 11, 4, 2);
      // Border
      g.lineStyle(1, 0xffcc80, 1);
      g.beginPath();
      g.moveTo(4, 10);
      g.lineTo(18, 10);
      g.lineTo(23, 12);
      g.lineTo(18, 14);
      g.lineTo(4, 14);
      g.closePath();
      g.strokePath();
      // SQL text hint
      g.lineStyle(1, 0xffffff, 0.5);
      g.beginPath();
      g.moveTo(7, 12);
      g.lineTo(15, 12);
      g.strokePath();
    });

    // Ransomware C2: Dark red padlock
    this.createTexture(scene, 'enemy_ransomware_c2', size, size, (g) => {
      // Shackle
      g.lineStyle(3, 0x8b0000, 1);
      g.beginPath();
      g.arc(12, 10, 6, Math.PI, 0, false);
      g.strokePath();
      // Lock body
      g.fillStyle(0x8b0000, 1);
      g.fillRoundedRect(5, 11, 14, 11, 2);
      g.lineStyle(1, 0xd32f2f, 1);
      g.strokeRoundedRect(5, 11, 14, 11, 2);
      // Keyhole
      g.fillStyle(0x000000, 1);
      g.fillCircle(12, 16, 2);
      g.fillRect(11, 16, 2, 4);
    });

    // Zero-Day: Very faint (nearly invisible)
    this.createTexture(scene, 'enemy_zero_day', size, size, (g) => {
      g.fillStyle(0x333333, 0.2);
      g.fillCircle(12, 12, 10);
      g.lineStyle(1, 0x555555, 0.2);
      g.strokeCircle(12, 12, 10);
      // Question mark (very faint)
      g.lineStyle(2, 0x999999, 0.2);
      g.beginPath();
      g.arc(12, 10, 4, Math.PI * 1.2, Math.PI * 0.1, false);
      g.strokePath();
      g.fillStyle(0x999999, 0.2);
      g.fillCircle(12, 17, 1.5);
    });

    // === OT THREATS (industrial, dark colors) ===

    // Modbus Exploit: Dark orange gear shape
    this.createTexture(scene, 'enemy_modbus_exploit', size, size, (g) => {
      g.fillStyle(0xcc5500, 1);
      const cx = 12;
      const cy = 12;
      const teeth = 8;
      const outerR = 11;
      const innerR = 7;
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
      g.fillStyle(0x0a1628, 1);
      g.fillCircle(cx, cy, 3);
    });

    // Firmware Worm: Purple worm/snake shape
    this.createTexture(scene, 'enemy_firmware_worm', size, size, (g) => {
      // Worm body segments (connected arcs)
      g.lineStyle(4, 0x753bbd, 1);
      g.beginPath();
      g.arc(8, 12, 4, Math.PI, 0, false);
      g.strokePath();
      g.beginPath();
      g.arc(16, 12, 4, 0, Math.PI, false);
      g.strokePath();
      // Connecting line
      g.lineStyle(4, 0x753bbd, 1);
      g.beginPath();
      g.moveTo(4, 12);
      g.lineTo(4, 12);
      g.strokePath();
      // Head
      g.fillStyle(0x9b59b6, 1);
      g.fillCircle(20, 12, 3);
      g.lineStyle(1, 0xce93d8, 1);
      g.strokeCircle(20, 12, 3);
    });

    // Signal Jammer: Yellow lightning bolt / radio waves
    this.createTexture(scene, 'enemy_signal_jammer', size, size, (g) => {
      // Radio wave arcs
      g.lineStyle(2, 0xe7d747, 0.6);
      g.beginPath();
      g.arc(12, 12, 10, -0.7, 0.7, false);
      g.strokePath();
      g.beginPath();
      g.arc(12, 12, 7, -0.5, 0.5, false);
      g.strokePath();
      // Lightning bolt center
      g.fillStyle(0xe7d747, 1);
      g.beginPath();
      g.moveTo(14, 4);
      g.lineTo(9, 13);
      g.lineTo(13, 13);
      g.lineTo(10, 20);
      g.lineTo(16, 11);
      g.lineTo(12, 11);
      g.lineTo(14, 4);
      g.closePath();
      g.fillPath();
    });

    // === OT LEGITIMATE TRAFFIC (industrial, amber/gold colors) ===

    // PLC Heartbeat: Amber pulse/heart shape
    this.createTexture(scene, 'enemy_plc_heartbeat', size, size, (g) => {
      g.fillStyle(0xd4920a, 1);
      // Heart shape
      g.beginPath();
      g.moveTo(12, 18);
      g.lineTo(5, 11);
      g.arc(8, 8, 4, Math.PI * 0.75, 0, true);
      g.arc(16, 8, 4, Math.PI, Math.PI * 0.25, true);
      g.lineTo(12, 18);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xffb74d, 1);
      g.strokePath();
      // Pulse line
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(6, 12);
      g.lineTo(9, 12);
      g.lineTo(11, 8);
      g.lineTo(13, 16);
      g.lineTo(15, 12);
      g.lineTo(18, 12);
      g.strokePath();
    });

    // SCADA Telemetry: Gold gauge/meter shape
    this.createTexture(scene, 'enemy_scada_telemetry', size, size, (g) => {
      g.fillStyle(0xb8860b, 1);
      g.beginPath();
      g.arc(12, 14, 10, Math.PI, 0, false);
      g.lineTo(22, 18);
      g.lineTo(2, 18);
      g.closePath();
      g.fillPath();
      g.lineStyle(1, 0xdaa520, 1);
      g.beginPath();
      g.arc(12, 14, 10, Math.PI, 0, false);
      g.strokePath();
      // Needle
      g.lineStyle(2, 0xffffff, 0.9);
      g.beginPath();
      g.moveTo(12, 14);
      g.lineTo(17, 7);
      g.strokePath();
      // Center
      g.fillStyle(0xffffff, 1);
      g.fillCircle(12, 14, 2);
    });

    // Track Switch Command: Yellow railroad switch icon
    this.createTexture(scene, 'enemy_track_switch_cmd', size, size, (g) => {
      // Rail lines
      g.lineStyle(3, 0xe7d747, 1);
      g.beginPath();
      g.moveTo(4, 18);
      g.lineTo(12, 6);
      g.strokePath();
      g.beginPath();
      g.moveTo(4, 18);
      g.lineTo(20, 18);
      g.strokePath();
      // Switch lever
      g.lineStyle(2, 0xffffff, 0.8);
      g.beginPath();
      g.moveTo(8, 14);
      g.lineTo(14, 14);
      g.strokePath();
      // Switch point
      g.fillStyle(0xe7d747, 1);
      g.fillCircle(4, 18, 3);
      g.lineStyle(1, 0xffeb3b, 1);
      g.strokeCircle(4, 18, 3);
    });

    // Train Position: Gold diamond (railroad marker)
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
      // Inner cross
      g.lineStyle(2, 0xffffff, 0.5);
      g.beginPath();
      g.moveTo(12, 6);
      g.lineTo(12, 18);
      g.moveTo(6, 12);
      g.lineTo(18, 12);
      g.strokePath();
    });

    // === LEGITIMATE TRAFFIC (smooth, cool colors, friendly) ===

    // HTTP Request: Blue circle
    this.createTexture(scene, 'enemy_http_request', size, size, (g) => {
      g.fillStyle(0x0076a8, 1);
      g.fillCircle(12, 12, 10);
      g.lineStyle(1, 0x48cae4, 1);
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

    // DNS Query: Green diamond
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
      // D letter
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(9, 8);
      g.lineTo(9, 16);
      g.arc(11, 12, 4, Math.PI * 1.5, Math.PI * 0.5, false);
      g.lineTo(9, 16);
      g.strokePath();
    });

    // API Call: Teal rounded rectangle
    this.createTexture(scene, 'enemy_api_call', size, size, (g) => {
      g.fillStyle(0x0093b2, 1);
      g.fillRoundedRect(3, 5, 18, 14, 5);
      g.lineStyle(1, 0x4dd0e1, 1);
      g.strokeRoundedRect(3, 5, 18, 14, 5);
      // Brackets {}
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(8, 8);
      g.lineTo(6, 12);
      g.lineTo(8, 16);
      g.moveTo(16, 8);
      g.lineTo(18, 12);
      g.lineTo(16, 16);
      g.strokePath();
    });

    // Email: Light green envelope
    this.createTexture(scene, 'enemy_email', size, size, (g) => {
      g.fillStyle(0xcbde8d, 1);
      g.fillRect(3, 7, 18, 12);
      g.lineStyle(1, 0x84bd00, 1);
      g.strokeRect(3, 7, 18, 12);
      // Envelope flap
      g.lineStyle(2, 0x5ea500, 0.9);
      g.beginPath();
      g.moveTo(3, 7);
      g.lineTo(12, 14);
      g.lineTo(21, 7);
      g.strokePath();
      // Bottom flap lines
      g.lineStyle(1, 0x5ea500, 0.4);
      g.beginPath();
      g.moveTo(3, 19);
      g.lineTo(9, 14);
      g.moveTo(21, 19);
      g.lineTo(15, 14);
      g.strokePath();
    });
  }

  private static generateProjectileTextures(scene: Phaser.Scene): void {
    const size = 10;

    const projectiles: Array<{ key: string; color: number }> = [
      { key: 'projectile_firewall', color: 0x0076a8 },
      { key: 'projectile_ids', color: 0x753bbd },
      { key: 'projectile_waf', color: 0xf47f28 },
      { key: 'projectile_honeypot', color: 0xe7d747 },
      { key: 'projectile_rate_limiter', color: 0x0093b2 },
      { key: 'projectile_packet_inspector', color: 0x84bd00 },
      { key: 'projectile_data_diode', color: 0x4caf50 },
      { key: 'projectile_network_segmentation', color: 0xe7d747 },
    ];

    for (const { key, color } of projectiles) {
      this.createTexture(scene, key, size, size, (g) => {
        // Elongated shape for directionality
        g.fillStyle(color, 1);
        g.beginPath();
        g.moveTo(10, 5);
        g.lineTo(6, 2);
        g.lineTo(1, 5);
        g.lineTo(6, 8);
        g.closePath();
        g.fillPath();
        // Bright core
        g.fillStyle(0xffffff, 0.6);
        g.fillCircle(7, 5, 2);
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
