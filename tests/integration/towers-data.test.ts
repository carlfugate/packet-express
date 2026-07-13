import { describe, it, expect } from 'vitest';
import { TOWERS } from '@/game/data/towers';

describe('towers data', () => {
  it('has unique tower IDs', () => {
    const ids = TOWERS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every tower has exactly 3 upgrade levels', () => {
    for (const tower of TOWERS) {
      expect(tower.upgrades).toHaveLength(3);
      expect(tower.upgrades[0].level).toBe(1);
      expect(tower.upgrades[1].level).toBe(2);
      expect(tower.upgrades[2].level).toBe(3);
    }
  });

  it('damage increases with each upgrade level', () => {
    for (const tower of TOWERS) {
      for (let i = 1; i < tower.upgrades.length; i++) {
        expect(tower.upgrades[i].damage).toBeGreaterThan(tower.upgrades[i - 1].damage);
      }
    }
  });

  it('range increases or stays same with each upgrade', () => {
    for (const tower of TOWERS) {
      for (let i = 1; i < tower.upgrades.length; i++) {
        expect(tower.upgrades[i].range).toBeGreaterThanOrEqual(tower.upgrades[i - 1].range);
      }
    }
  });

  it('fire rate decreases (faster) or stays same with each upgrade', () => {
    for (const tower of TOWERS) {
      for (let i = 1; i < tower.upgrades.length; i++) {
        expect(tower.upgrades[i].fireRate).toBeLessThanOrEqual(tower.upgrades[i - 1].fireRate);
      }
    }
  });

  it('all towers have valid targeting modes', () => {
    const validModes = ['first', 'closest', 'strongest', 'area'];
    for (const tower of TOWERS) {
      expect(validModes).toContain(tower.targetingMode);
    }
  });

  it('costs are positive integers', () => {
    for (const tower of TOWERS) {
      expect(tower.cost).toBeGreaterThan(0);
      expect(Number.isInteger(tower.cost)).toBe(true);
    }
  });

  it('canHitLegitimate is boolean', () => {
    for (const tower of TOWERS) {
      expect(typeof tower.canHitLegitimate).toBe('boolean');
    }
  });

  it('towers with slowFactor have it between 0.1 and 0.9', () => {
    for (const tower of TOWERS) {
      for (const upgrade of tower.upgrades) {
        if (upgrade.slowFactor !== undefined) {
          expect(upgrade.slowFactor).toBeGreaterThanOrEqual(0.1);
          expect(upgrade.slowFactor).toBeLessThanOrEqual(0.9);
        }
      }
    }
  });

  it('honeypot and rate_limiter have slowFactor on all upgrades', () => {
    const slowTowers = TOWERS.filter(t => t.id === 'honeypot' || t.id === 'rate_limiter');
    expect(slowTowers).toHaveLength(2);
    for (const tower of slowTowers) {
      for (const upgrade of tower.upgrades) {
        expect(upgrade.slowFactor).toBeDefined();
        expect(upgrade.slowFactor).toBeGreaterThan(0);
        expect(upgrade.slowFactor).toBeLessThan(1);
      }
    }
  });

  it('packet_inspector has reveals: true', () => {
    const pi = TOWERS.find(t => t.id === 'packet_inspector');
    expect(pi).toBeDefined();
    expect(pi!.reveals).toBe(true);
  });

  it('waf has bonusVs array', () => {
    const waf = TOWERS.find(t => t.id === 'waf');
    expect(waf).toBeDefined();
    expect(waf!.bonusVs).toBeDefined();
    expect(waf!.bonusVs!.length).toBeGreaterThan(0);
  });
});
