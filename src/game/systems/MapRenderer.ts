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

    // Nearly black background
    bg.fillStyle(0x030810, 1);
    bg.fillRect(0, 0, 1280, 720);

    // Very dim gray grid
    const gridSpacing = 40;
    bg.lineStyle(1, 0x1a1a2e, 0.06);

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

    // IT zone: bright green active track at 2px
    g.lineStyle(2, 0x00cc66, 1);
    g.beginPath();
    g.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i <= boundaryIndex && i < waypoints.length; i++) {
      g.lineTo(waypoints[i].x, waypoints[i].y);
    }
    g.strokePath();

    // OT zone: bright amber active track at 2px
    if (boundaryIndex < waypoints.length) {
      g.lineStyle(2, 0xff9900, 1);
      g.beginPath();
      g.moveTo(waypoints[boundaryIndex].x, waypoints[boundaryIndex].y);
      for (let i = boundaryIndex + 1; i < waypoints.length; i++) {
        g.lineTo(waypoints[i].x, waypoints[i].y);
      }
      g.strokePath();
    }

    // Flow direction arrows along the track
    this.drawFlowArrows(g, waypoints, boundaryIndex);

    // Dense decorative track infrastructure
    this.drawDecorativeTracks(g);

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

  private drawDecorativeTracks(g: Phaser.GameObjects.Graphics): void {
    // Seeded pseudo-random for consistent visuals between frames
    const seed = 42;
    const rng = (i: number): number => {
      const x = Math.sin(seed + i * 9301 + 49297) * 49297;
      return x - Math.floor(x);
    };

    // --- Between runs 1 and 2 (y=100 to y=240) ---
    const band1Lines = [130, 160, 190];
    for (let li = 0; li < band1Lines.length; li++) {
      const y = band1Lines[li];
      const startX = 100 + rng(li * 10) * 200;
      const endX = 900 + rng(li * 10 + 1) * 200;
      g.lineStyle(1, 0x444444, 0.5);
      g.beginPath();
      g.moveTo(startX, y);
      g.lineTo(endX, y);
      g.strokePath();

      // Siding branches (short stubs at 30 degrees)
      for (let s = 0; s < 3; s++) {
        const sx = startX + (endX - startX) * (0.2 + s * 0.3);
        const dir = rng(li * 100 + s) > 0.5 ? 1 : -1;
        const stubLen = 40 + rng(li * 100 + s + 50) * 20;
        const angle = (dir * Math.PI) / 6;
        g.lineStyle(1, 0x444444, 0.4);
        g.beginPath();
        g.moveTo(sx, y);
        g.lineTo(sx + Math.cos(angle) * stubLen, y + Math.sin(angle) * stubLen);
        g.strokePath();
      }

      // Switch junction marks
      const jx = startX + 20;
      g.lineStyle(1.5, 0x555555, 0.5);
      g.beginPath();
      g.moveTo(jx, y - 4);
      g.lineTo(jx + 6, y);
      g.lineTo(jx, y + 4);
      g.strokePath();
    }

    // Signal triangles between runs 1 and 2
    this.drawDecorativeSignals(g, 150, 900, 120, 200, 5, 0);

    // --- Between runs 2 and 3 (y=240 to y=380) ---
    const band2Lines = [270, 295, 320, 345];
    for (let li = 0; li < band2Lines.length; li++) {
      const y = band2Lines[li];
      const startX = 80 + rng(li * 20 + 100) * 150;
      const endX = 950 + rng(li * 20 + 101) * 150;
      g.lineStyle(1.5, 0x555555, 0.5);
      g.beginPath();
      g.moveTo(startX, y);
      g.lineTo(endX, y);
      g.strokePath();

      // Cross-connections between adjacent parallels
      if (li < band2Lines.length - 1) {
        for (let c = 0; c < 2; c++) {
          const cx = startX + (endX - startX) * (0.3 + c * 0.4);
          g.lineStyle(1, 0x444444, 0.4);
          g.beginPath();
          g.moveTo(cx, y);
          g.lineTo(cx + 30, band2Lines[li + 1]);
          g.strokePath();
        }
      }
    }

    // Station labels in band 2
    const stationLabels = [
      { x: 300, y: 270, text: 'SIG-04' },
      { x: 600, y: 320, text: 'JCT-B' },
      { x: 900, y: 295, text: 'XOVER-2' },
    ];
    for (const sl of stationLabels) {
      const label = this.scene.add.text(sl.x, sl.y - 10, sl.text, {
        fontSize: '8px',
        color: '#555555',
        fontFamily: 'monospace',
      });
      label.setDepth(-4);
    }

    // Signal triangles between runs 2 and 3
    this.drawDecorativeSignals(g, 120, 1000, 260, 355, 8, 200);

    // --- Between runs 3 and 4 (y=380 to y=520) ---
    const band3Lines = [420, 450, 480];
    for (let li = 0; li < band3Lines.length; li++) {
      const y = band3Lines[li];
      const startX = 120 + rng(li * 30 + 200) * 180;
      const endX = 850 + rng(li * 30 + 201) * 200;

      // Some lines highlighted in dim red (blocked routes)
      const isBlocked = li === 1;
      if (isBlocked) {
        g.lineStyle(1.5, 0x8b0000, 0.3);
      } else {
        g.lineStyle(1, 0x444444, 0.5);
      }
      g.beginPath();
      g.moveTo(startX, y);
      g.lineTo(endX, y);
      g.strokePath();

      // Dead-end sidings with buffer-stop (T-shape at end)
      if (li === 0 || li === 2) {
        const bufX = endX + 40;
        g.lineStyle(1, 0x444444, 0.4);
        g.beginPath();
        g.moveTo(endX, y);
        g.lineTo(bufX, y);
        g.strokePath();
        // T-shape buffer stop
        g.lineStyle(2, 0x555555, 0.5);
        g.beginPath();
        g.moveTo(bufX, y - 5);
        g.lineTo(bufX, y + 5);
        g.strokePath();
      }
    }

    // Signal triangles between runs 3 and 4
    this.drawDecorativeSignals(g, 150, 900, 410, 490, 6, 400);

    // --- Left and right edge stubs ---
    // Left edge vertical stubs
    const leftStubYs = [150, 310, 460];
    for (const sy of leftStubYs) {
      g.lineStyle(1, 0x444444, 0.4);
      g.beginPath();
      g.moveTo(0, sy);
      g.lineTo(60, sy);
      g.strokePath();
      // Arrow pointing off-edge (left)
      g.fillStyle(0x444444, 0.4);
      g.beginPath();
      g.moveTo(0, sy);
      g.lineTo(8, sy - 3);
      g.lineTo(8, sy + 3);
      g.closePath();
      g.fillPath();
    }

    // Right edge vertical stubs
    const rightStubYs = [170, 330, 440];
    for (const sy of rightStubYs) {
      g.lineStyle(1, 0x444444, 0.4);
      g.beginPath();
      g.moveTo(1220, sy);
      g.lineTo(1280, sy);
      g.strokePath();
      // Arrow pointing off-edge (right)
      g.fillStyle(0x444444, 0.4);
      g.beginPath();
      g.moveTo(1280, sy);
      g.lineTo(1272, sy - 3);
      g.lineTo(1272, sy + 3);
      g.closePath();
      g.fillPath();
    }
  }

  private drawDecorativeSignals(
    g: Phaser.GameObjects.Graphics,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    count: number,
    seedOffset: number,
  ): void {
    const rng = (i: number): number => {
      const x = Math.sin(seedOffset + i * 7919 + 31337) * 49297;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const sx = minX + rng(i * 2) * (maxX - minX);
      const sy = minY + rng(i * 2 + 1) * (maxY - minY);
      const isGreen = rng(i * 3) > 0.5;

      // Small triangle signal (6px)
      if (isGreen) {
        g.fillStyle(0x2e8b57, 0.5);
      } else {
        g.fillStyle(0x8b2500, 0.4);
      }
      g.beginPath();
      g.moveTo(sx, sy - 3);
      g.lineTo(sx + 3, sy + 3);
      g.lineTo(sx - 3, sy + 3);
      g.closePath();
      g.fillPath();

      // Small dot at some positions
      if (rng(i * 4) > 0.6) {
        const dotColor = isGreen ? 0x2e8b57 : 0x8b2500;
        const dotAlpha = isGreen ? 0.5 : 0.4;
        g.fillStyle(dotColor, dotAlpha);
        g.fillCircle(sx + 10, sy, 1.5);
      }
    }
  }

  private drawFlowArrows(
    g: Phaser.GameObjects.Graphics,
    waypoints: Array<{ x: number; y: number }>,
    boundaryIndex: number,
  ): void {
    const arrowSpacing = 80;
    const arrowSize = 10;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const segDist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / segDist;
      const uy = dy / segDist;

      const inOT = i >= boundaryIndex;
      const color = inOT ? 0xff9900 : 0x00cc66;
      g.fillStyle(color, 1);

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

    // Single amber dashed line across full width
    g.lineStyle(1, 0xff9900, 0.6);
    this.drawDashedLine(g, 0, boundaryY, 1280, boundaryY, 8, 4);

    // DMZ label centered
    const dmzLabel = this.scene.add.text(640, boundaryY - 10, 'DMZ', {
      fontSize: '8px',
      color: '#FF9900',
      fontFamily: 'Arial',
    });
    dmzLabel.setOrigin(0.5, 0.5);
    dmzLabel.setDepth(0);
  }

  private addZoneLabels(): void {
    // IT NETWORK label at top-left of active track
    const itLabel = this.scene.add.text(50, 85, 'IT NETWORK', {
      fontSize: '10px',
      color: '#00CC66',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    itLabel.setDepth(0);

    // OT / INDUSTRIAL label at boundary
    const boundaryIndex = GAME_CONFIG.otZone.boundaryWaypointIndex;
    const boundaryY =
      boundaryIndex < MAP_DATA.waypoints.length ? MAP_DATA.waypoints[boundaryIndex].y : 380;

    const otLabel = this.scene.add.text(50, boundaryY + 8, 'OT / INDUSTRIAL', {
      fontSize: '10px',
      color: '#FF9900',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    otLabel.setDepth(0);
  }

  private addDataFlowParticles(
    waypoints: Array<{ x: number; y: number }>,
    boundaryIndex: number,
  ): void {
    const particleCount = 10;
    const threatParticleCount = 3;
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

    // Normal data flow particles — dimmer (0.4 alpha)
    for (let p = 0; p < particleCount; p++) {
      const dot = this.scene.add.circle(waypoints[0].x, waypoints[0].y, 1.5, 0x00cc66, 0.4);
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
            dot.setFillStyle(0xff9900, 0.4); // Amber in OT zone
          } else {
            dot.setFillStyle(0x00cc66, 0.4); // Green in IT zone
          }
        },
      });
    }

    // Red threat traffic particles — fast, every ~3 seconds
    for (let p = 0; p < threatParticleCount; p++) {
      const dot = this.scene.add.circle(waypoints[0].x, waypoints[0].y, 1.5, 0xff3333, 0.4);
      dot.setDepth(1);

      const follower = { t: 0, vec: new Phaser.Math.Vector2() };
      this.scene.tweens.add({
        targets: follower,
        t: 1,
        duration: 4000,
        repeat: -1,
        delay: 3000 * p,
        onUpdate: () => {
          path.getPoint(follower.t, follower.vec);
          dot.setPosition(follower.vec.x, follower.vec.y);
          dot.setAlpha(0.3 + Math.sin(follower.t * Math.PI * 4) * 0.2);
        },
      });
    }
  }

  drawTowerSlots(slots: Array<{ x: number; y: number; id: string }>): void {
    const g = this.slotGraphics;
    g.clear();
    g.setDepth(-2);

    const slotSize = 40;
    const half = slotSize / 2;
    const cornerRadius = 4;

    for (const slot of slots) {
      // Subtle teal fill so slots read as interactive zones
      g.fillStyle(0x0093b2, 0.08);
      g.fillRoundedRect(slot.x - half, slot.y - half, slotSize, slotSize, cornerRadius);

      // Teal border — visible but not overwhelming
      g.lineStyle(1.5, 0x0093b2, 0.6);
      g.strokeRoundedRect(slot.x - half, slot.y - half, slotSize, slotSize, cornerRadius);

      // "+" icon in center — brighter teal
      const plusSize = 8;
      g.lineStyle(1.5, 0x0093b2, 0.5);
      g.beginPath();
      g.moveTo(slot.x - plusSize / 2, slot.y);
      g.lineTo(slot.x + plusSize / 2, slot.y);
      g.strokePath();
      g.beginPath();
      g.moveTo(slot.x, slot.y - plusSize / 2);
      g.lineTo(slot.x, slot.y + plusSize / 2);
      g.strokePath();

      // Station label below each slot
      const slotIndex = parseInt(slot.id.replace('slot_', ''), 10);
      const label = this.scene.add.text(
        slot.x,
        slot.y + half + 4,
        `NODE-${String(slotIndex).padStart(2, '0')}`,
        {
          fontSize: '8px',
          color: '#666666',
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

    const slotSize = 40;
    const half = slotSize / 2;
    const cornerRadius = 4;
    const g = this.slotGraphics;

    // Brighten border to full teal
    g.lineStyle(1.5, color, 1);
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
