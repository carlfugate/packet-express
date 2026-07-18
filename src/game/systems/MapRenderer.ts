import { MAP_DATA } from '../data/maps';
import { GAME_CONFIG } from '../config';

export class MapRenderer {
  private scene: Phaser.Scene;
  private trackGraphics: Phaser.GameObjects.Graphics;
  private slotGraphics: Phaser.GameObjects.Graphics;
  private slotPositions: Map<string, { x: number; y: number }> = new Map();
  private slotLabels: Map<string, Phaser.GameObjects.Text> = new Map();
  private signalDots: Phaser.GameObjects.Arc[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.trackGraphics = scene.add.graphics();
    this.slotGraphics = scene.add.graphics();

    for (const slot of MAP_DATA.towerSlots) {
      this.slotPositions.set(slot.id, { x: slot.x, y: slot.y });
    }

    this.drawBackground();
  }

  private drawBackground(): void {
    const bg = this.scene.add.graphics();
    bg.setDepth(-10);

    // Solid dark navy background
    bg.fillStyle(0x0a1628, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Subtle dashed grid — control system display aesthetic
    const gridSpacing = 60;
    bg.lineStyle(1, 0x0076a8, 0.08);

    for (let x = 0; x < 1280; x += gridSpacing) {
      this.drawDashedLine(bg, x, 0, x, 720, 4, 8);
    }
    for (let y = 0; y < 720; y += gridSpacing) {
      this.drawDashedLine(bg, 0, y, 1280, y, 4, 8);
    }
  }

  private drawDashedLine(
    g: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dash: number,
    gap: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
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
        g.moveTo(x1 + ux * drawn, y1 + uy * drawn);
        g.lineTo(x1 + ux * end, y1 + uy * end);
        g.strokePath();
      }
      drawn = end;
      drawing = !drawing;
    }
  }

  drawTrack(waypoints: Array<{ x: number; y: number }>): void {
    const g = this.trackGraphics;
    g.clear();
    g.setDepth(-5);

    if (waypoints.length < 2) return;

    const boundaryIndex = GAME_CONFIG.otZone.boundaryWaypointIndex;

    // Draw main track: thin 3px light gray line
    g.lineStyle(3, 0xaaaaaa, 1);
    g.beginPath();
    g.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      g.lineTo(waypoints[i].x, waypoints[i].y);
    }
    g.strokePath();

    // Segment coloring overlays
    // IT zone (first half): green tint
    g.lineStyle(3, 0x84bd00, 0.3);
    g.beginPath();
    g.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i <= boundaryIndex && i < waypoints.length; i++) {
      g.lineTo(waypoints[i].x, waypoints[i].y);
    }
    g.strokePath();

    // OT zone (second half): amber tint
    if (boundaryIndex < waypoints.length) {
      g.lineStyle(3, 0xf47f28, 0.2);
      g.beginPath();
      g.moveTo(waypoints[boundaryIndex].x, waypoints[boundaryIndex].y);
      for (let i = boundaryIndex + 1; i < waypoints.length; i++) {
        g.lineTo(waypoints[i].x, waypoints[i].y);
      }
      g.strokePath();
    }

    // Flow direction arrows along the track
    this.drawFlowArrows(g, waypoints, boundaryIndex);

    // Signal dots at waypoints
    this.drawSignalDots(waypoints);

    // Switch indicators at corners
    this.drawSwitchIndicators(g, waypoints);

    // Zone boundary line
    this.drawZoneBoundary(g, waypoints, boundaryIndex);

    // Zone labels
    this.addZoneLabels();

    // Data flow particles
    this.addDataFlowParticles(waypoints, boundaryIndex);
  }

  private drawFlowArrows(
    g: Phaser.GameObjects.Graphics,
    waypoints: Array<{ x: number; y: number }>,
    boundaryIndex: number,
  ): void {
    const arrowSpacing = 80;
    const arrowSize = 8;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const segDist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / segDist;
      const uy = dy / segDist;

      const inOT = i >= boundaryIndex;
      const color = inOT ? 0xf47f28 : 0x84bd00;
      g.fillStyle(color, 0.7);

      let d = arrowSpacing / 2;
      while (d < segDist - arrowSpacing / 4) {
        const cx = a.x + ux * d;
        const cy = a.y + uy * d;

        // Triangle arrow pointing in direction of travel
        const tipX = cx + ux * (arrowSize / 2);
        const tipY = cy + uy * (arrowSize / 2);
        const baseX = cx - ux * (arrowSize / 2);
        const baseY = cy - uy * (arrowSize / 2);
        // Perpendicular
        const px = -uy;
        const py = ux;

        g.beginPath();
        g.moveTo(tipX, tipY);
        g.lineTo(baseX + px * (arrowSize / 3), baseY + py * (arrowSize / 3));
        g.lineTo(baseX - px * (arrowSize / 3), baseY - py * (arrowSize / 3));
        g.closePath();
        g.fillPath();

        d += arrowSpacing;
      }
    }
  }

  private drawSignalDots(waypoints: Array<{ x: number; y: number }>): void {
    // Clear old signal dots
    for (const dot of this.signalDots) {
      dot.destroy();
    }
    this.signalDots = [];

    for (const wp of waypoints) {
      const dot = this.scene.add.circle(wp.x, wp.y, 3, 0x5ea500, 1);
      dot.setDepth(-4);
      this.signalDots.push(dot);
    }
  }

  private drawSwitchIndicators(
    g: Phaser.GameObjects.Graphics,
    waypoints: Array<{ x: number; y: number }>,
  ): void {
    g.lineStyle(1, 0xaaaaaa, 0.5);

    for (let i = 1; i < waypoints.length - 1; i++) {
      const prev = waypoints[i - 1];
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      // Direction into waypoint
      const dxIn = curr.x - prev.x;
      const dyIn = curr.y - prev.y;
      const distIn = Math.sqrt(dxIn * dxIn + dyIn * dyIn);
      const uxIn = dxIn / distIn;
      const uyIn = dyIn / distIn;

      // Direction out of waypoint
      const dxOut = next.x - curr.x;
      const dyOut = next.y - curr.y;
      const distOut = Math.sqrt(dxOut * dxOut + dyOut * dyOut);
      const uxOut = dxOut / distOut;
      const uyOut = dyOut / distOut;

      // Only draw switch if there's a direction change (corner)
      if (Math.abs(uxIn - uxOut) > 0.01 || Math.abs(uyIn - uyOut) > 0.01) {
        const switchLen = 12;
        const angle = Math.PI / 6; // 30 degrees

        // Diverging line based on incoming direction
        const cos30 = Math.cos(angle);
        const sin30 = Math.sin(angle);

        // Rotate incoming direction by +30 degrees
        const rx1 = uxIn * cos30 - uyIn * sin30;
        const ry1 = uxIn * sin30 + uyIn * cos30;
        g.beginPath();
        g.moveTo(curr.x, curr.y);
        g.lineTo(curr.x + rx1 * switchLen, curr.y + ry1 * switchLen);
        g.strokePath();

        // Rotate incoming direction by -30 degrees
        const rx2 = uxIn * cos30 + uyIn * sin30;
        const ry2 = -uxIn * sin30 + uyIn * cos30;
        g.beginPath();
        g.moveTo(curr.x, curr.y);
        g.lineTo(curr.x + rx2 * switchLen, curr.y + ry2 * switchLen);
        g.strokePath();
      }
    }
  }

  private drawZoneBoundary(
    g: Phaser.GameObjects.Graphics,
    waypoints: Array<{ x: number; y: number }>,
    boundaryIndex: number,
  ): void {
    if (boundaryIndex >= waypoints.length) return;

    const boundaryY = waypoints[boundaryIndex].y;

    // Thin dashed hazard stripe: alternating yellow/black 2px segments
    const segWidth = 12;
    for (let x = 0; x < 1280; x += segWidth * 2) {
      // Yellow segment
      g.lineStyle(2, 0xe7d747, 0.6);
      g.beginPath();
      g.moveTo(x, boundaryY);
      g.lineTo(x + segWidth, boundaryY);
      g.strokePath();

      // Black segment
      g.lineStyle(2, 0x000000, 0.6);
      g.beginPath();
      g.moveTo(x + segWidth, boundaryY);
      g.lineTo(x + segWidth * 2, boundaryY);
      g.strokePath();
    }
  }

  private addZoneLabels(): void {
    // IT NETWORK label at top-left
    const itLabel = this.scene.add.text(40, 65, 'IT NETWORK', {
      fontSize: '11px',
      color: '#0093B2',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    itLabel.setDepth(0);
    itLabel.setAlpha(0.6);

    // OT / INDUSTRIAL label at boundary
    const boundaryIndex = GAME_CONFIG.otZone.boundaryWaypointIndex;
    const boundaryY =
      boundaryIndex < MAP_DATA.waypoints.length ? MAP_DATA.waypoints[boundaryIndex].y : 380;

    const otLabel = this.scene.add.text(40, boundaryY + 8, 'OT / INDUSTRIAL', {
      fontSize: '11px',
      color: '#F47F28',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    otLabel.setDepth(0);
    otLabel.setAlpha(0.6);
  }

  private addDataFlowParticles(
    waypoints: Array<{ x: number; y: number }>,
    boundaryIndex: number,
  ): void {
    const particleCount = 10;
    const threatParticleCount = 2;
    const path = new Phaser.Curves.Path(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      path.lineTo(waypoints[i].x, waypoints[i].y);
    }

    // Calculate boundary t (proportion along the path)
    let totalLength = 0;
    const segLengths: number[] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1].x - waypoints[i].x;
      const dy = waypoints[i + 1].y - waypoints[i].y;
      const seg = Math.sqrt(dx * dx + dy * dy);
      segLengths.push(seg);
      totalLength += seg;
    }
    let boundaryLength = 0;
    for (let i = 0; i < boundaryIndex && i < segLengths.length; i++) {
      boundaryLength += segLengths[i];
    }
    const boundaryT = totalLength > 0 ? boundaryLength / totalLength : 0.5;

    // Normal data flow particles
    for (let p = 0; p < particleCount; p++) {
      const dot = this.scene.add.circle(waypoints[0].x, waypoints[0].y, 1.5, 0x84bd00, 0.8);
      dot.setDepth(1);

      const follower = { t: 0, vec: new Phaser.Math.Vector2() };
      this.scene.tweens.add({
        targets: follower,
        t: 1,
        duration: 10000,
        repeat: -1,
        delay: p * 1000,
        onUpdate: () => {
          path.getPoint(follower.t, follower.vec);
          dot.setPosition(follower.vec.x, follower.vec.y);
          // Color based on zone
          if (follower.t > boundaryT) {
            dot.setFillStyle(0xf47f28, 0.8); // Amber in OT zone
          } else {
            dot.setFillStyle(0x84bd00, 0.8); // Green in IT zone
          }
        },
      });
    }

    // Occasional red threat traffic particles (purely cosmetic)
    for (let p = 0; p < threatParticleCount; p++) {
      const dot = this.scene.add.circle(waypoints[0].x, waypoints[0].y, 1.5, 0xff3333, 0.6);
      dot.setDepth(1);

      const follower = { t: 0, vec: new Phaser.Math.Vector2() };
      this.scene.tweens.add({
        targets: follower,
        t: 1,
        duration: 8000,
        repeat: -1,
        delay: 3000 + p * 5000,
        onUpdate: () => {
          path.getPoint(follower.t, follower.vec);
          dot.setPosition(follower.vec.x, follower.vec.y);
          // Pulse alpha for threat feel
          dot.setAlpha(0.3 + Math.sin(follower.t * Math.PI * 4) * 0.3);
        },
      });
    }
  }

  drawTowerSlots(slots: Array<{ x: number; y: number; id: string }>): void {
    const g = this.slotGraphics;
    g.clear();
    g.setDepth(-2);

    const slotSize = 36;
    const half = slotSize / 2;
    const cornerRadius = 4;

    for (const slot of slots) {
      // Thin rectangular outline with rounded corners
      g.lineStyle(1, 0x0093b2, 0.4);
      g.strokeRoundedRect(slot.x - half, slot.y - half, slotSize, slotSize, cornerRadius);

      // Small "+" in center at 0.3 alpha
      g.lineStyle(1, 0x0093b2, 0.3);
      g.beginPath();
      g.moveTo(slot.x, slot.y - 6);
      g.lineTo(slot.x, slot.y + 6);
      g.moveTo(slot.x - 6, slot.y);
      g.lineTo(slot.x + 6, slot.y);
      g.strokePath();

      // Station label below each slot
      const slotIndex = parseInt(slot.id.replace('slot_', ''), 10);
      const label = this.scene.add.text(
        slot.x,
        slot.y + half + 4,
        `NODE-${String(slotIndex).padStart(2, '0')}`,
        {
          fontSize: '9px',
          color: '#7A7B7C',
          fontFamily: 'Arial',
        },
      );
      label.setOrigin(0.5, 0);
      label.setDepth(0);
      this.slotLabels.set(slot.id, label);
    }
  }

  highlightSlot(slotId: string, color: number): void {
    const pos = this.slotPositions.get(slotId);
    if (!pos) return;

    const slotSize = 36;
    const half = slotSize / 2;
    const cornerRadius = 4;
    const g = this.slotGraphics;

    // Brighten border to full teal
    g.lineStyle(1, color, 1);
    g.strokeRoundedRect(pos.x - half, pos.y - half, slotSize, slotSize, cornerRadius);
  }

  clearHighlight(_slotId: string): void {
    this.drawTowerSlots(MAP_DATA.towerSlots);
  }

  /** Update a slot label when a tower is placed (e.g., "FW-01", "IDS-02") */
  updateSlotLabel(slotId: string, towerAbbrev: string): void {
    const label = this.slotLabels.get(slotId);
    if (label) {
      const slotIndex = parseInt(slotId.replace('slot_', ''), 10);
      label.setText(`${towerAbbrev}-${String(slotIndex).padStart(2, '0')}`);
    }
  }

  /** Flash signal dots red when enemies are near (call from game loop) */
  flashSignalsNearEnemies(enemyPositions: Array<{ x: number; y: number }>): void {
    const proximityThreshold = 60;

    for (const dot of this.signalDots) {
      let nearEnemy = false;
      for (const enemy of enemyPositions) {
        const dx = dot.x - enemy.x;
        const dy = dot.y - enemy.y;
        if (dx * dx + dy * dy < proximityThreshold * proximityThreshold) {
          nearEnemy = true;
          break;
        }
      }
      dot.setFillStyle(nearEnemy ? 0xff0000 : 0x5ea500, 1);
    }
  }
}
