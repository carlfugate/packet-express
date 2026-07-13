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
  }

  drawTrack(waypoints: Array<{ x: number; y: number }>): void {
    const g = this.trackGraphics;
    g.clear();

    if (waypoints.length < 2) return;

    // Draw railroad ties (perpendicular marks along the path)
    g.lineStyle(2, 0x4a4a4a, 0.6);
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(dist / 20);
      const nx = -dy / dist;
      const ny = dx / dist;

      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        const cx = a.x + dx * t;
        const cy = a.y + dy * t;
        g.beginPath();
        g.moveTo(cx + nx * 10, cy + ny * 10);
        g.lineTo(cx - nx * 10, cy - ny * 10);
        g.strokePath();
      }
    }

    // Draw main rails (two parallel lines)
    for (const offset of [-6, 6]) {
      g.lineStyle(3, 0x666666, 1);
      g.beginPath();
      for (let i = 0; i < waypoints.length; i++) {
        let nx = 0;
        let ny = 0;
        if (i < waypoints.length - 1) {
          const dx = waypoints[i + 1].x - waypoints[i].x;
          const dy = waypoints[i + 1].y - waypoints[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          nx = -dy / dist;
          ny = dx / dist;
        } else if (i > 0) {
          const dx = waypoints[i].x - waypoints[i - 1].x;
          const dy = waypoints[i].y - waypoints[i - 1].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          nx = -dy / dist;
          ny = dx / dist;
        }
        const px = waypoints[i].x + nx * offset;
        const py = waypoints[i].y + ny * offset;
        if (i === 0) {
          g.moveTo(px, py);
        } else {
          g.lineTo(px, py);
        }
      }
      g.strokePath();
    }

    // Data flow particles along path (green dots moving along track)
    this.addDataFlowParticles(waypoints);
  }

  private addDataFlowParticles(waypoints: Array<{ x: number; y: number }>): void {
    for (let p = 0; p < 5; p++) {
      const dot = this.scene.add.circle(waypoints[0].x, waypoints[0].y, 3, 0x84bd00, 0.6);
      dot.setDepth(1);

      const path = new Phaser.Curves.Path(waypoints[0].x, waypoints[0].y);
      for (let i = 1; i < waypoints.length; i++) {
        path.lineTo(waypoints[i].x, waypoints[i].y);
      }

      const follower = { t: 0, vec: new Phaser.Math.Vector2() };
      this.scene.tweens.add({
        targets: follower,
        t: 1,
        duration: 12000,
        repeat: -1,
        delay: p * 2400,
        onUpdate: () => {
          path.getPoint(follower.t, follower.vec);
          dot.setPosition(follower.vec.x, follower.vec.y);
        },
      });
    }
  }

  drawTowerSlots(slots: Array<{ x: number; y: number; id: string }>): void {
    const g = this.slotGraphics;
    g.clear();

    const slotSize = 44;
    const half = slotSize / 2;

    for (const slot of slots) {
      // Fill: dark navy (#044872)
      g.fillStyle(0x044872, 0.6);
      g.fillRect(slot.x - half, slot.y - half, slotSize, slotSize);

      // Dashed border: light blue (#0093B2)
      g.lineStyle(2, 0x0093b2, 0.8);
      const dashLen = 6;
      const gapLen = 4;

      // Draw dashed rectangle
      this.drawDashedRect(g, slot.x - half, slot.y - half, slotSize, slotSize, dashLen, gapLen);
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
    // Redraw all slots to clear individual highlights
    this.drawTowerSlots(MAP_DATA.towerSlots);
  }
}
