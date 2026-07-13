import { describe, it, expect } from 'vitest';
import { ENEMIES } from '@/game/data/enemies';

describe('enemies data', () => {
  it('has unique enemy IDs', () => {
    const ids = ENEMIES.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all enemies have valid type', () => {
    for (const enemy of ENEMIES) {
      expect(['threat', 'legitimate']).toContain(enemy.type);
    }
  });
});
