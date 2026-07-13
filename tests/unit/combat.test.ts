import { describe, it, expect } from 'vitest';
import {
  calculateDamage,
  isInRange,
  selectTarget,
  calculateBonusDamage,
  applySlowFactor,
} from '../../src/game/logic/combat';

describe('combat logic', () => {
  describe('calculateDamage', () => {
    it('returns base damage at level 0', () => {
      expect(calculateDamage(10, 0)).toBe(10);
    });

    it('scales 1.5x at level 1', () => {
      expect(calculateDamage(10, 1)).toBe(15);
    });

    it('scales 2x at level 2', () => {
      expect(calculateDamage(10, 2)).toBe(20);
    });

    it('scales 2.5x at level 3', () => {
      expect(calculateDamage(10, 3)).toBe(25);
    });

    it('handles non-integer base damage', () => {
      expect(calculateDamage(7, 1)).toBeCloseTo(10.5);
    });
  });

  describe('isInRange', () => {
    it('returns true when target is within range', () => {
      expect(isInRange({ x: 0, y: 0 }, { x: 3, y: 4 }, 5)).toBe(true);
    });

    it('returns true when target is exactly at range boundary', () => {
      expect(isInRange({ x: 0, y: 0 }, { x: 3, y: 4 }, 5)).toBe(true);
    });

    it('returns false when target is beyond range', () => {
      expect(isInRange({ x: 0, y: 0 }, { x: 3, y: 4 }, 4.9)).toBe(false);
    });

    it('returns true when target is at same position', () => {
      expect(isInRange({ x: 5, y: 5 }, { x: 5, y: 5 }, 1)).toBe(true);
    });

    it('calculates correct euclidean distance with offset positions', () => {
      expect(isInRange({ x: 10, y: 10 }, { x: 13, y: 14 }, 5)).toBe(true);
      expect(isInRange({ x: 10, y: 10 }, { x: 13, y: 14 }, 4.9)).toBe(false);
    });
  });

  describe('selectTarget', () => {
    const towerPos = { x: 5, y: 5 };
    const range = 10;

    const enemies = [
      { position: { x: 6, y: 6 }, distanceOnPath: 100, isLegitimate: false, health: 50 },
      { position: { x: 7, y: 7 }, distanceOnPath: 200, isLegitimate: false, health: 80 },
      { position: { x: 8, y: 8 }, distanceOnPath: 50, isLegitimate: true, health: 30 },
      { position: { x: 50, y: 50 }, distanceOnPath: 300, isLegitimate: false, health: 100 },
    ];

    it('selects enemy furthest along path in "first" mode', () => {
      const result = selectTarget(towerPos, range, enemies, 'first', true);
      expect(result).toBe(1); // index 1 has distanceOnPath 200 (index 3 is out of range)
    });

    it('selects nearest enemy in "closest" mode', () => {
      const result = selectTarget(towerPos, range, enemies, 'closest', true);
      expect(result).toBe(0); // index 0 is closest to tower
    });

    it('selects highest health enemy in "strongest" mode', () => {
      const result = selectTarget(towerPos, range, enemies, 'strongest', true);
      expect(result).toBe(1); // index 1 has 80 health (index 3 out of range)
    });

    it('uses same logic as "first" for "area" mode', () => {
      const result = selectTarget(towerPos, range, enemies, 'area', true);
      expect(result).toBe(1); // same as first
    });

    it('skips legitimate enemies when canHitLegitimate is false', () => {
      const result = selectTarget(towerPos, range, enemies, 'closest', false);
      expect(result).toBe(0); // index 2 is legitimate, skipped
    });

    it('can target legitimate enemies when canHitLegitimate is true', () => {
      const closeEnemies = [
        { position: { x: 5, y: 5 }, distanceOnPath: 100, isLegitimate: true, health: 50 },
      ];
      const result = selectTarget(towerPos, range, closeEnemies, 'closest', true);
      expect(result).toBe(0);
    });

    it('returns null when no enemies are in range', () => {
      const farEnemies = [
        { position: { x: 50, y: 50 }, distanceOnPath: 100, isLegitimate: false, health: 50 },
      ];
      const result = selectTarget(towerPos, range, farEnemies, 'first', true);
      expect(result).toBeNull();
    });

    it('returns null when enemies array is empty', () => {
      const result = selectTarget(towerPos, range, [], 'first', true);
      expect(result).toBeNull();
    });

    it('returns null when all in-range enemies are legitimate and canHitLegitimate is false', () => {
      const legitOnly = [
        { position: { x: 6, y: 6 }, distanceOnPath: 100, isLegitimate: true, health: 50 },
      ];
      const result = selectTarget(towerPos, range, legitOnly, 'first', false);
      expect(result).toBeNull();
    });
  });

  describe('calculateBonusDamage', () => {
    it('returns double damage when enemy type is in bonusVs', () => {
      expect(calculateBonusDamage(10, 'malware', ['malware', 'ddos'])).toBe(20);
    });

    it('returns base damage when enemy type is not in bonusVs', () => {
      expect(calculateBonusDamage(10, 'phishing', ['malware', 'ddos'])).toBe(10);
    });

    it('returns base damage when bonusVs is undefined', () => {
      expect(calculateBonusDamage(10, 'malware', undefined)).toBe(10);
    });

    it('returns base damage when bonusVs is empty array', () => {
      expect(calculateBonusDamage(10, 'malware', [])).toBe(10);
    });
  });

  describe('applySlowFactor', () => {
    it('reduces speed by slow factor', () => {
      expect(applySlowFactor(100, 0.5)).toBe(50);
    });

    it('enforces minimum 10% speed', () => {
      expect(applySlowFactor(100, 0.05)).toBe(10);
    });

    it('returns full speed when slowFactor is 1.0', () => {
      expect(applySlowFactor(100, 1.0)).toBe(100);
    });

    it('never goes below 10% even with zero slowFactor', () => {
      expect(applySlowFactor(100, 0)).toBe(10);
    });

    it('handles fractional base speeds', () => {
      expect(applySlowFactor(60, 0.5)).toBe(30);
    });
  });
});
