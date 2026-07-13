import { describe, it, expect } from 'vitest';
import {
  calculateTowerCost,
  calculateSellPrice,
  calculateKillReward,
  calculateWaveClearBonus,
  calculateEarlyCallBonus,
  canAfford,
} from '../../src/game/logic/economy';

describe('economy logic', () => {
  describe('calculateTowerCost', () => {
    it('returns base cost at level 0', () => {
      expect(calculateTowerCost(100, 0)).toBe(100);
    });

    it('returns 1.5x base cost at level 1', () => {
      expect(calculateTowerCost(100, 1)).toBe(150);
    });

    it('returns 2.5x base cost at level 2', () => {
      expect(calculateTowerCost(100, 2)).toBe(250);
    });

    it('falls back to multiplier[0] for invalid upgrade levels', () => {
      expect(calculateTowerCost(100, 5)).toBe(100);
    });

    it('rounds the result for non-round base costs', () => {
      expect(calculateTowerCost(75, 1)).toBe(113); // 75 * 1.5 = 112.5 rounds to 113
    });
  });

  describe('calculateSellPrice', () => {
    it('returns 70% of base cost for level 0 tower with 0.7 multiplier', () => {
      expect(calculateSellPrice(100, 0, 0.7)).toBe(70);
    });

    it('returns 70% of total invested for level 1 tower', () => {
      // Level 0 cost: 100, Level 1 cost: 150, total: 250, sell: 175
      expect(calculateSellPrice(100, 1, 0.7)).toBe(175);
    });

    it('returns 70% of total invested for level 2 tower', () => {
      // Level 0: 100, Level 1: 150, Level 2: 250, total: 500, sell: 350
      expect(calculateSellPrice(100, 2, 0.7)).toBe(350);
    });

    it('respects different sell multipliers', () => {
      expect(calculateSellPrice(100, 0, 0.5)).toBe(50);
    });

    it('handles non-round base costs with rounding', () => {
      // Level 0: round(75*1) = 75, Level 1: round(75*1.5) = 113
      // Total: 188, sell: round(188 * 0.7) = 132
      expect(calculateSellPrice(75, 1, 0.7)).toBe(132);
    });
  });

  describe('calculateKillReward', () => {
    it('returns flat base reward regardless of wave', () => {
      expect(calculateKillReward(10, 1)).toBe(10);
      expect(calculateKillReward(10, 10)).toBe(10);
      expect(calculateKillReward(10, 20)).toBe(10);
    });

    it('returns the exact base reward value', () => {
      expect(calculateKillReward(25, 5)).toBe(25);
    });
  });

  describe('calculateWaveClearBonus', () => {
    it('returns 31 for wave 1', () => {
      expect(calculateWaveClearBonus(1)).toBe(31);
    });

    it('returns 34 for wave 2', () => {
      expect(calculateWaveClearBonus(2)).toBe(34);
    });

    it('scales linearly: 28 + wave * 3', () => {
      expect(calculateWaveClearBonus(10)).toBe(58);
      expect(calculateWaveClearBonus(20)).toBe(88);
    });
  });

  describe('calculateEarlyCallBonus', () => {
    it('returns double the remaining seconds', () => {
      expect(calculateEarlyCallBonus(1, 10)).toBe(20);
    });

    it('returns 0 when no time remaining', () => {
      expect(calculateEarlyCallBonus(1, 0)).toBe(0);
    });

    it('rounds fractional seconds', () => {
      expect(calculateEarlyCallBonus(1, 5.5)).toBe(11);
    });

    it('ignores wave number (not used in calculation)', () => {
      expect(calculateEarlyCallBonus(1, 10)).toBe(calculateEarlyCallBonus(10, 10));
    });
  });

  describe('canAfford', () => {
    it('returns true when credits equal cost', () => {
      expect(canAfford(100, 100)).toBe(true);
    });

    it('returns true when credits exceed cost', () => {
      expect(canAfford(200, 100)).toBe(true);
    });

    it('returns false when credits are less than cost', () => {
      expect(canAfford(50, 100)).toBe(false);
    });

    it('returns true when cost is 0', () => {
      expect(canAfford(0, 0)).toBe(true);
    });
  });
});
