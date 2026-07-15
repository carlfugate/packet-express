import { MAP_DATA } from '../data/maps';

export class MapRenderer {
  private scene: Phaser.Scene;
  private trackGraphics: Phaser.GameObjects.Graphics;
  private slotGraphics: Phaser.GameObjects.Graphics;
  private slotPositions: Map<string, { x: number; y: number }> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.trackGraphics = scene.add.graphics();
    this.slotGraphics = scene.add.graphics();

    for (const slot of MAP_DATA.towerSlots) {
      this.slotPositions.set(slot.id, { x: slot.x, y: slot.y });
    }

    // Dark navy gradient background
    this.drawBackground();
  }

  private drawBackground(): void {
    const bg = this.scene.add.graphics();
    bg.setDepth(-10);
    // Navy gradient from top to bottom
    const steps = 20;
    const h = 720 / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      // Interpolate from #0A1628 (top) to #061020 (bottom)
      const r = Math.round(10 + t * (-4));
      const g2 = Math.round(22 + t * (-6));
      const b = Math.round(40 + t * (-8));
      const color = (Math.max(0, r) << 16) | (Math.max(0, g2) << 8) | Math.max(0, b);
      bg.fillStyle(color, 1);
      bg.fillRect(0, i * h, 1280, h + 1);
    }
    // Subtle grid overlay
    bg.lineStyle(1, 0x0076a8, 0.05);
    for (let x = 0; x < 1280; x += 40) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, 720);
      bg.strokePath();
    }
    for (let y = 0; y < 720; y += 40) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(1280, y);
      bg.strokePath();
    }

    // IT Zone: Circuit board dots pattern (top half)
    this.drawITZoneDetail(bg);

    // OT Zone: Industrial icons (bottom half)
    this.drawOTZoneDetail(bg);

    // Vignette overlay (darker edges)
    this.drawVignette(bg);
  }

  private drawITZoneDetail(bg: Phaser.GameObjects.Graphics): void {
    // Faint circuit-board dot grid at very low opacity
    bg.fillStyle(0x0093b2, 0.04);
    for (let x = 20; x < 1280; x += 60) {
      for (let y = 20; y < 300; y += 60) {
        bg.fillCircle(x, y, 1.5);
        // Occasional connection lines between dots
        if (Math.random() > 0.6 && x + 60 < 1280) {
          bg.lineStyle(1, 0x0093b2, 0.03);
          bg.beginPath();
          bg.moveTo(x, y);
          bg.lineTo(x + 60, y);
          bg.strokePath();
        }
        if (Math.random() > 0.7 && y + 60 < 300) {
          bg.lineStyle(1, 0x0093b2, 0.03);
          bg.beginPath();
          bg.moveTo(x, y);
          bg.lineTo(x, y + 60);
          bg.strokePath();
        }
      }
    }
  }

  private drawOTZoneDetail(bg: Phaser.GameObjects.Graphics): void {
    // Scattered industrial icons at very low opacity in OT zone (y > 320)
    const iconPositions = [
      { x: 100, y: 400 }, { x: 300, y: 450 }, { x: 500, y: 380 },
      { x: 700, y: 500 }, { x: 900, y: 420 }, { x: 1100, y: 460 },
      { x: 200, y: 550 }, { x: 600, y: 600 }, { x: 1000, y: 550 },
      { x: 400, y: 650 }, { x: 800, y: 620 }, { x: 150, y: 650 },
    ];

    for (let i = 0; i < iconPositions.length; i++) {
      const pos = iconPositions[i];
      const type = i % 3;

      if (type === 0) {
        // Tiny gear shape
        bg.lineStyle(1, 0xf47f28, 0.04);
        const teeth = 6;
        bg.beginPath();
        for (let t = 0; t < teeth * 2; t++) {
          const angle = (Math.PI * t) / teeth;
          const r = t % 2 === 0 ? 8 : 5;
          const px = pos.x + r * Math.cos(angle);
          const py = pos.y + r * Math.sin(angle);
          if (t === 0) bg.moveTo(px, py);
          else bg.lineTo(px, py);
        }
        bg.closePath();
        bg.strokePath();
      } else if (type === 1) {
        // Railroad crossing X
        bg.lineStyle(1, 0xe7d747, 0.04);
        bg.beginPath();
        bg.moveTo(pos.x - 6, pos.y - 6);
        bg.lineTo(pos.x + 6, pos.y + 6);
        bg.strokePath();
        bg.beginPath();
        bg.moveTo(pos.x + 6, pos.y - 6);
        bg.lineTo(pos.x - 6, pos.y + 6);
        bg.strokePath();
      } else {
        // Signal light (small circle with line below)
        bg.lineStyle(1, 0xf47f28, 0.04);
        bg.strokeCircle(pos.x, pos.y, 4);
        bg.beginPath();
        bg.moveTo(pos.x, pos.y + 4);
        bg.lineTo(pos.x, pos.y + 10);
        bg.strokePath();
      }
    }
  }

  private drawVignette(bg: Phaser.GameObjects.Graphics): void {
    // Darken edges with semi-transparent rectangles
    const edgeAlpha = 0.15;
    // Top edge
    bg.fillStyle(0x000000, edgeAlpha);
    bg.fillRect(0, 0, 1280, 40);
    bg.fillStyle(0x000000, edgeAlpha * 0.6);
    bg.fillRect(0, 40, 1280, 30);
    // Bottom edge
    bg.fillStyle(0x000000, edgeAlpha);
    bg.fillRect(0, 680, 1280, 40);
    bg.fillStyle(0x000000, edgeAlpha * 0.6);
    bg.fillRect(0, 650, 1280, 30);
    // Left edge
    bg.fillStyle(0x000000, edgeAlpha * 0.5);
    bg.fillRect(0, 0, 30, 720);
    // Right edge
    bg.fillStyle(0x000000, edgeAlpha * 0.5);
    bg.fillRect(1250, 0, 30, 720);
  }

  drawTrack(waypoints: Array<{ x: number; y: number }>): void {
    const g = this.trackGraphics;
    g.clear();
    g.setDepth(-5);

    if (waypoints.length < 2) return;

    // OT Zone: Semi-transparent orange overlay covering the bottom half (OT zone)
    g.fillStyle(0xf47f28, 0.04);
    g.fillRect(0, 310, 1280, 330);

    // Hazard stripe at boundary (y=310) — alternating yellow/black diagonal lines
    const stripeY = 310;
    const stripeHeight = 8;
    const stripeWidth = 16;
    for (let x = 0; x < 1280; x += stripeWidth * 2) {
      // Yellow stripe
      g.fillStyle(0xe7d747, 0.8);
      g.beginPath();
      g.moveTo(x, stripeY);
      g.lineTo(x + stripeWidth, stripeY);
      g.lineTo(x + stripeWidth + stripeHeight, stripeY + stripeHeight);
      g.lineTo(x + stripeHeight, stripeY + stripeHeight);
      g.closePath();
      g.fillPath();
      // Black stripe
      g.fillStyle(0x000000, 0.8);
      g.beginPath();
      g.moveTo(x + stripeWidth, stripeY);
      g.lineTo(x + stripeWidth * 2, stripeY);
      g.lineTo(x + stripeWidth * 2 + stripeHeight, stripeY + stripeHeight);
      g.lineTo(x + stripeWidth + stripeHeight, stripeY + stripeHeight);
      g.closePath();
      g.fillPath();
    }

    // Step 1: Draw the rail bed (thick outer line)
    g.lineStyle(22, 0x3a3a3a, 1);
    g.beginPath();
    g.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      g.lineTo(waypoints[i].x, waypoints[i].y);
    }
    g.strokePath();

    // Step 2: Draw the dark center (creates the appearance of dual rails)
    g.lineStyle(14, 0x0a1628, 1);
    g.beginPath();
    g.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      g.lineTo(waypoints[i].x, waypoints[i].y);
    }
    g.strokePath();

    // Step 3: Draw cross-ties on straight segments only, with margin to avoid corner overlap
    g.lineStyle(3, 0x555555, 0.9);
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Determine normal (perpendicular)
      const nx = -dy / dist;
      const ny = dx / dist;

      // Draw ties every 25px, but skip the first and last 15px to avoid corner overlap
      const margin = 15;
      const tieSpacing = 25;

      let d = margin;
      while (d < dist - margin) {
        const t = d / dist;
        const cx = a.x + dx * t;
        const cy = a.y + dy * t;
        g.beginPath();
        g.moveTo(cx + nx * 11, cy + ny * 11);
        g.lineTo(cx - nx * 11, cy - ny * 11);
        g.strokePath();
        d += tieSpacing;
      }
    }

    // Step 4: Draw thin rail lines on top of ties for detail (per-segment, not continuous)
    for (const offset of [-8, 8]) {
      g.lineStyle(2, 0x666666, 1);
      for (let i = 0; i < waypoints.length - 1; i++) {
        const a = waypoints[i];
        const b = waypoints[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / dist;
        const ny = dx / dist;

        g.beginPath();
        g.moveTo(a.x + nx * offset, a.y + ny * offset);
        g.lineTo(b.x + nx * offset, b.y + ny * offset);
        g.strokePath();
      }
    }

    // Zone labels
    this.addZoneLabels();

    // Station labels
    this.addStationLabels(waypoints);

    // Data flow particles
    this.addDataFlowParticles(waypoints);
  }

  private addZoneLabels(): void {
    // IT ZONE label near the top
    const itLabel = this.scene.add.text(600, 65, 'IT ZONE', {
      fontSize: '14px',
      color: '#0093B2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    itLabel.setDepth(0);
    itLabel.setAlpha(0.7);

    // OT ZONE label near the boundary
    const otLabel = this.scene.add.text(590, 325, 'OT ZONE', {
      fontSize: '14px',
      color: '#F47F28',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    otLabel.setDepth(0);
    otLabel.setAlpha(0.7);
  }

  private addStationLabels(waypoints: Array<{ x: number; y: number }>): void {
    const spawn = waypoints[0];
    const exit = waypoints[waypoints.length - 1];

    // KC Station label at spawn (top-left)
    const kcLabel = this.scene.add.text(spawn.x + 10, spawn.y - 30, 'KC Station', {
      fontSize: '12px',
      color: '#84BD00',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    kcLabel.setDepth(0);

    // CHI Terminal label at exit (bottom-left)
    const chiLabel = this.scene.add.text(exit.x + 10, exit.y - 30, 'CHI Terminal', {
      fontSize: '12px',
      color: '#F47F28',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    chiLabel.setDepth(0);
  }

  private addDataFlowParticles(waypoints: Array<{ x: number; y: number }>): void {
    for (let p = 0; p < 6; p++) {
      const dot = this.scene.add.circle(waypoints[0].x, waypoints[0].y, 2, 0x84bd00, 0.7);
      dot.setDepth(1);

      const path = new Phaser.Curves.Path(waypoints[0].x, waypoints[0].y);
      for (let i = 1; i < waypoints.length; i++) {
        path.lineTo(waypoints[i].x, waypoints[i].y);
      }

      const follower = { t: 0, vec: new Phaser.Math.Vector2() };
      this.scene.tweens.add({
        targets: follower,
        t: 1,
        duration: 14000,
        repeat: -1,
        delay: p * 2300,
        onUpdate: () => {
          path.getPoint(follower.t, follower.vec);
          dot.setPosition(follower.vec.x, follower.vec.y);
          dot.setAlpha(0.3 + Math.sin(follower.t * Math.PI * 6) * 0.4);
        },
      });
    }
  }

  drawTowerSlots(slots: Array<{ x: number; y: number; id: string }>): void {
    const g = this.slotGraphics;
    g.clear();
    g.setDepth(-2);

    const slotSize = 44;
    const half = slotSize / 2;

    for (const slot of slots) {
      // Glow effect (outer)
      g.fillStyle(0x0093b2, 0.1);
      g.fillRect(slot.x - half - 2, slot.y - half - 2, slotSize + 4, slotSize + 4);

      // Fill: dark navy
      g.fillStyle(0x044872, 0.6);
      g.fillRect(slot.x - half, slot.y - half, slotSize, slotSize);

      // Dashed border
      g.lineStyle(2, 0x0093b2, 0.8);
      this.drawDashedRect(g, slot.x - half, slot.y - half, slotSize, slotSize, 6, 4);

      // Plus icon in center
      g.lineStyle(2, 0x0093b2, 0.4);
      g.beginPath();
      g.moveTo(slot.x, slot.y - 8);
      g.lineTo(slot.x, slot.y + 8);
      g.moveTo(slot.x - 8, slot.y);
      g.lineTo(slot.x + 8, slot.y);
      g.strokePath();
    }
  }

  private drawDashedRect(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    dash: number,
    gap: number,
  ): void {
    const sides = [
      { x1: x, y1: y, x2: x + w, y2: y },
      { x1: x + w, y1: y, x2: x + w, y2: y + h },
      { x1: x + w, y1: y + h, x2: x, y2: y + h },
      { x1: x, y1: y + h, x2: x, y2: y },
    ];

    for (const side of sides) {
      const dx = side.x2 - side.x1;
      const dy = side.y2 - side.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / length;
      const uy = dy / length;
      let drawn = 0;
      let drawing = true;

      while (drawn < length) {
        const segLen = drawing ? dash : gap;
        const end = Math.min(drawn + segLen, length);
        if (drawing) {
          g.beginPath();
          g.moveTo(side.x1 + ux * drawn, side.y1 + uy * drawn);
          g.lineTo(side.x1 + ux * end, side.y1 + uy * end);
          g.strokePath();
        }
        drawn = end;
        drawing = !drawing;
      }
    }
  }

  highlightSlot(slotId: string, color: number): void {
    const pos = this.slotPositions.get(slotId);
    if (!pos) return;

    const slotSize = 44;
    const half = slotSize / 2;
    const g = this.slotGraphics;

    g.fillStyle(color, 0.4);
    g.fillRect(pos.x - half, pos.y - half, slotSize, slotSize);
    g.lineStyle(2, color, 1);
    g.strokeRect(pos.x - half, pos.y - half, slotSize, slotSize);
  }

  clearHighlight(slotId: string): void {
    this.drawTowerSlots(MAP_DATA.towerSlots);
  }
}
