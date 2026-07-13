export interface MapData {
  waypoints: Array<{ x: number; y: number }>;
  towerSlots: Array<{ x: number; y: number; id: string }>;
  spawnPoint: { x: number; y: number };
  exitPoint: { x: number; y: number };
}

// Snake-pattern railroad track across 1280x720 game area
// 4 horizontal runs connected by vertical segments
// Spawn far left, exit far right
export const MAP_DATA: MapData = {
  spawnPoint: { x: 0, y: 140 },
  exitPoint: { x: 1280, y: 580 },
  waypoints: [
    // Run 1: left to right, y=140
    { x: 0, y: 140 },
    { x: 200, y: 140 },
    { x: 400, y: 140 },
    { x: 600, y: 140 },
    { x: 800, y: 140 },
    { x: 1000, y: 140 },
    { x: 1150, y: 140 },
    // Vertical drop 1
    { x: 1150, y: 290 },
    // Run 2: right to left, y=290
    { x: 1000, y: 290 },
    { x: 800, y: 290 },
    { x: 600, y: 290 },
    { x: 400, y: 290 },
    { x: 200, y: 290 },
    { x: 130, y: 290 },
    // Vertical drop 2
    { x: 130, y: 440 },
    // Run 3: left to right, y=440
    { x: 200, y: 440 },
    { x: 400, y: 440 },
    { x: 600, y: 440 },
    { x: 800, y: 440 },
    { x: 1000, y: 440 },
    { x: 1150, y: 440 },
    // Vertical drop 3
    { x: 1150, y: 580 },
    // Run 4: right to left then exit, y=580
    { x: 1000, y: 580 },
    { x: 800, y: 580 },
    { x: 600, y: 580 },
    { x: 400, y: 580 },
    { x: 200, y: 580 },
    // Final turn to exit
    { x: 130, y: 580 },
    { x: 130, y: 660 },
    { x: 300, y: 660 },
    { x: 500, y: 660 },
    { x: 700, y: 660 },
    { x: 900, y: 660 },
    { x: 1100, y: 660 },
    { x: 1280, y: 580 },
  ],
  towerSlots: [
    // Along run 1 (below the path)
    { x: 300, y: 200, id: 'slot_1' },
    { x: 500, y: 200, id: 'slot_2' },
    { x: 700, y: 200, id: 'slot_3' },
    { x: 900, y: 200, id: 'slot_4' },
    // Along run 2 (above the path)
    { x: 900, y: 230, id: 'slot_5' },
    { x: 700, y: 230, id: 'slot_6' },
    { x: 500, y: 230, id: 'slot_7' },
    { x: 300, y: 230, id: 'slot_8' },
    // Along run 2 (below the path)
    { x: 400, y: 350, id: 'slot_9' },
    { x: 600, y: 350, id: 'slot_10' },
    { x: 800, y: 350, id: 'slot_11' },
    // Along run 3 (above the path)
    { x: 300, y: 380, id: 'slot_12' },
    { x: 700, y: 380, id: 'slot_13' },
    { x: 1000, y: 380, id: 'slot_14' },
    // Along run 3/4 (below)
    { x: 500, y: 510, id: 'slot_15' },
    { x: 900, y: 510, id: 'slot_16' },
  ],
};
