import { describe, it, expect } from 'vitest';
import { TOWERS } from '@/game/data/towers';

describe('towers data', () => {
  it('has unique tower IDs', () => {
    const ids = TOWERS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all towers have at least one upgrade', () => {
    for (const tower of TOWERS) {
      expect(tower.upgrades.length).toBeGreaterThan(0);
    }
  });
});
