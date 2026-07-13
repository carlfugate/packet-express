import { describe, it, expect } from 'vitest';
import { WAVES } from '@/game/data/waves';
import { ENEMIES } from '@/game/data/enemies';

const enemyMap = Object.fromEntries(ENEMIES.map(e => [e.id, e]));
const legitimateTypes = ENEMIES.filter(e => e.type === 'legitimate').map(e => e.id);

describe('waves data', () => {
  it('has exactly 20 waves', () => {
    expect(WAVES).toHaveLength(20);
  });

  it('wave numbers are sequential 1-20', () => {
    for (let i = 0; i < WAVES.length; i++) {
      expect(WAVES[i].wave).toBe(i + 1);
    }
  });

  it('all enemy types referenced in waves exist in ENEMIES', () => {
    for (const wave of WAVES) {
      for (const entry of wave.enemies) {
        expect(enemyMap[entry.type]).toBeDefined();
      }
    }
  });

  it('waves 1-3 contain NO legitimate traffic types', () => {
    for (let i = 0; i < 3; i++) {
      for (const entry of WAVES[i].enemies) {
        expect(legitimateTypes).not.toContain(entry.type);
      }
    }
  });

  it('waves 4+ contain at least some legitimate traffic', () => {
    for (let i = 3; i < WAVES.length; i++) {
      const hasLegit = WAVES[i].enemies.some(e => legitimateTypes.includes(e.type));
      expect(hasLegit).toBe(true);
    }
  });

  it('total enemy count generally increases across waves', () => {
    const counts = WAVES.map(w => w.enemies.reduce((sum, e) => sum + e.count, 0));
    // Check that later waves are generally larger — allow minor dips but overall trend up
    // Compare first third vs last third
    const firstThird = counts.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
    const lastThird = counts.slice(13).reduce((a, b) => a + b, 0) / 7;
    expect(lastThird).toBeGreaterThan(firstThird);
  });

  it('all waves have positive bonus', () => {
    for (const wave of WAVES) {
      expect(wave.bonus).toBeGreaterThan(0);
    }
  });

  it('DDoS entries have interval < 500ms', () => {
    for (const wave of WAVES) {
      for (const entry of wave.enemies) {
        if (entry.type === 'ddos' && entry.interval !== undefined) {
          expect(entry.interval).toBeLessThan(500);
        }
      }
    }
  });

  it('all waves have at least one enemy entry', () => {
    for (const wave of WAVES) {
      expect(wave.enemies.length).toBeGreaterThan(0);
    }
  });
});
