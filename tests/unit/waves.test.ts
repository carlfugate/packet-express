import { describe, it, expect } from 'vitest';
import {
  getWaveEnemyCount,
  getWaveThreatCount,
  getWaveLegitCount,
  calculateSpawnDelay,
  getHealthMultiplier,
  getScaledHealth,
} from '../../src/game/logic/waves';
import { Wave, EnemyConfig } from '../../src/game/types';

const enemyConfigs: Record<string, EnemyConfig> = {
  malware: {
    id: 'malware',
    name: 'Malware',
    type: 'threat',
    health: 100,
    speed: 60,
    reward: 10,
    scoreValue: 100,
    description: 'Basic malware packet',
    abilities: [],
  },
  ddos: {
    id: 'ddos',
    name: 'DDoS',
    type: 'threat',
    health: 50,
    speed: 80,
    reward: 5,
    scoreValue: 50,
    description: 'DDoS flood packet',
    abilities: [],
  },
  http_request: {
    id: 'http_request',
    name: 'HTTP Request',
    type: 'legitimate',
    health: 30,
    speed: 70,
    reward: 0,
    scoreValue: 0,
    falsePositivePenalty: 200,
    description: 'Legitimate HTTP request',
    abilities: [],
  },
};

describe('wave logic', () => {
  describe('getWaveEnemyCount', () => {
    it('sums all enemy counts in the wave', () => {
      const wave: Wave = {
        wave: 1,
        enemies: [
          { type: 'malware', count: 5 },
          { type: 'ddos', count: 3 },
        ],
        bonus: 30,
      };
      expect(getWaveEnemyCount(wave)).toBe(8);
    });

    it('returns 0 for a wave with no enemies', () => {
      const wave: Wave = { wave: 1, enemies: [], bonus: 30 };
      expect(getWaveEnemyCount(wave)).toBe(0);
    });

    it('handles a single entry', () => {
      const wave: Wave = {
        wave: 1,
        enemies: [{ type: 'malware', count: 10 }],
        bonus: 30,
      };
      expect(getWaveEnemyCount(wave)).toBe(10);
    });
  });

  describe('getWaveThreatCount', () => {
    it('counts only threat-type enemies', () => {
      const wave: Wave = {
        wave: 4,
        enemies: [
          { type: 'malware', count: 5 },
          { type: 'http_request', count: 3 },
          { type: 'ddos', count: 2 },
        ],
        bonus: 30,
      };
      expect(getWaveThreatCount(wave, enemyConfigs)).toBe(7);
    });

    it('returns 0 when wave has only legitimate enemies', () => {
      const wave: Wave = {
        wave: 4,
        enemies: [{ type: 'http_request', count: 5 }],
        bonus: 30,
      };
      expect(getWaveThreatCount(wave, enemyConfigs)).toBe(0);
    });

    it('skips unknown enemy types', () => {
      const wave: Wave = {
        wave: 1,
        enemies: [
          { type: 'malware', count: 3 },
          { type: 'unknown', count: 5 },
        ],
        bonus: 30,
      };
      expect(getWaveThreatCount(wave, enemyConfigs)).toBe(3);
    });
  });

  describe('getWaveLegitCount', () => {
    it('counts only legitimate-type enemies', () => {
      const wave: Wave = {
        wave: 4,
        enemies: [
          { type: 'malware', count: 5 },
          { type: 'http_request', count: 3 },
        ],
        bonus: 30,
      };
      expect(getWaveLegitCount(wave, enemyConfigs)).toBe(3);
    });

    it('returns 0 when wave has only threats', () => {
      const wave: Wave = {
        wave: 1,
        enemies: [{ type: 'malware', count: 5 }],
        bonus: 30,
      };
      expect(getWaveLegitCount(wave, enemyConfigs)).toBe(0);
    });
  });

  describe('calculateSpawnDelay', () => {
    it('uses entry interval when specified', () => {
      const entry = { type: 'malware', count: 5, interval: 800 };
      expect(calculateSpawnDelay(entry, 1)).toBe(800);
    });

    it('calculates default delay when no interval specified', () => {
      const entry = { type: 'malware', count: 5 };
      // 1200 - 1 * 40 = 1160
      expect(calculateSpawnDelay(entry, 1)).toBe(1160);
    });

    it('decreases delay with higher wave numbers', () => {
      const entry = { type: 'malware', count: 5 };
      expect(calculateSpawnDelay(entry, 10)).toBe(800); // 1200 - 400
    });

    it('enforces minimum of 400ms', () => {
      const entry = { type: 'malware', count: 5 };
      // 1200 - 30 * 40 = 1200 - 1200 = 0, clamped to 400
      expect(calculateSpawnDelay(entry, 30)).toBe(400);
    });

    it('enforces minimum at exact boundary (wave 20: 1200 - 800 = 400)', () => {
      const entry = { type: 'malware', count: 5 };
      expect(calculateSpawnDelay(entry, 20)).toBe(400);
    });
  });

  describe('getHealthMultiplier', () => {
    it('returns 1.0 for wave 1', () => {
      expect(getHealthMultiplier(1)).toBeCloseTo(1.0);
    });

    it('returns 1.11 for wave 2', () => {
      expect(getHealthMultiplier(2)).toBeCloseTo(1.11);
    });

    it('increases 11% per wave', () => {
      expect(getHealthMultiplier(10)).toBeCloseTo(1.99);
    });
  });

  describe('getScaledHealth', () => {
    it('returns base health for wave 1', () => {
      expect(getScaledHealth(100, 1)).toBe(100);
    });

    it('scales health for later waves', () => {
      // 100 * 1.11 = 111
      expect(getScaledHealth(100, 2)).toBe(111);
    });

    it('rounds to nearest integer', () => {
      // 50 * 1.11 = 55.5, rounds to 56
      expect(getScaledHealth(50, 2)).toBe(56);
    });

    it('returns significantly higher health at wave 10', () => {
      // 100 * 1.99 = 199
      expect(getScaledHealth(100, 10)).toBe(199);
    });
  });
});
