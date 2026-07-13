import { describe, it, expect } from 'vitest';
import { WAVES } from '@/game/data/waves';

describe('waves data', () => {
  it('has sequential wave numbers', () => {
    for (let i = 0; i < WAVES.length; i++) {
      expect(WAVES[i].wave).toBe(i + 1);
    }
  });

  it('all waves have at least one enemy entry', () => {
    for (const wave of WAVES) {
      expect(wave.enemies.length).toBeGreaterThan(0);
    }
  });
});
