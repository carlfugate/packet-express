export interface MapData {
  waypoints: Array<{ x: number; y: number }>;
  towerSlots: Array<{ x: number; y: number; id: string }>;
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
}

// Snake-pattern railroad track across 1280x720 game area
// Playable area: y=60 to y=640 (top 50px = HUD, bottom 70px = tower bar)
// 4 horizontal runs at y=100, y=240, y=380, y=520
// Connected by short vertical segments — never crosses itself
export const MAP_DATA: MapData = {
  spawnPoint: { x: 0, y: 100 },
  exitPoint: { x: 0, y: 520 },
  waypoints: [
    // Run 1: left to right, y=100
    { x: 40, y: 100 },
    { x: 320, y: 100 },
    { x: 640, y: 100 },
    { x: 960, y: 100 },
    { x: 1240, y: 100 },
    // Vertical drop 1: right side, y=100 → y=240
    { x: 1240, y: 240 },
    // Run 2: right to left, y=240
    { x: 960, y: 240 },
    { x: 640, y: 240 },
    { x: 320, y: 240 },
    { x: 40, y: 240 },
    // Vertical drop 2: left side, y=240 → y=380
    { x: 40, y: 380 },
    // Run 3: left to right, y=380
    { x: 320, y: 380 },
    { x: 640, y: 380 },
    { x: 960, y: 380 },
    { x: 1240, y: 380 },
    // Vertical drop 3: right side, y=380 → y=520
    { x: 1240, y: 520 },
    // Run 4: right to left, y=520
    { x: 960, y: 520 },
    { x: 640, y: 520 },
    { x: 320, y: 520 },
    { x: 40, y: 520 },
  ],
  towerSlots: [
    // Between runs 1 and 2 (y=100 and y=240) → place at y=170
    { x: 200, y: 170, id: 'slot_1' },
    { x: 480, y: 170, id: 'slot_2' },
    { x: 760, y: 170, id: 'slot_3' },
    { x: 1040, y: 170, id: 'slot_4' },
    // Between runs 2 and 3 (y=240 and y=380) → place at y=310
    { x: 200, y: 310, id: 'slot_5' },
    { x: 480, y: 310, id: 'slot_6' },
    { x: 760, y: 310, id: 'slot_7' },
    { x: 1040, y: 310, id: 'slot_8' },
    // Between runs 3 and 4 (y=380 and y=520) → place at y=450
    { x: 200, y: 450, id: 'slot_9' },
    { x: 480, y: 450, id: 'slot_10' },
    { x: 760, y: 450, id: 'slot_11' },
    { x: 1040, y: 450, id: 'slot_12' },
  ],
};
