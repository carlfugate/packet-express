import { describe, it, expect } from 'vitest';
import { ENEMIES } from '@/game/data/enemies';

const KNOWN_ABILITIES = ['swarm', 'disguise', 'armor_pierce', 'encrypted', 'regen', 'stealth', 'armor'];

describe('enemies data', () => {
  it('has unique enemy IDs', () => {
    const ids = ENEMIES.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all enemies have positive health and speed', () => {
    for (const enemy of ENEMIES) {
      expect(enemy.health).toBeGreaterThan(0);
      expect(enemy.speed).toBeGreaterThan(0);
    }
  });

  it('all enemies have valid type', () => {
    for (const enemy of ENEMIES) {
      expect(['threat', 'legitimate']).toContain(enemy.type);
    }
  });

  it('all threats have positive reward and scoreValue', () => {
    const threats = ENEMIES.filter(e => e.type === 'threat');
    expect(threats.length).toBeGreaterThan(0);
    for (const enemy of threats) {
      expect(enemy.reward).toBeGreaterThan(0);
      expect(enemy.scoreValue).toBeGreaterThan(0);
    }
  });

  it('all legitimate traffic has reward: 0, scoreValue: 0, and falsePositivePenalty > 0', () => {
    const legit = ENEMIES.filter(e => e.type === 'legitimate');
    expect(legit.length).toBeGreaterThan(0);
    for (const enemy of legit) {
      expect(enemy.reward).toBe(0);
      expect(enemy.scoreValue).toBe(0);
      expect(enemy.falsePositivePenalty).toBeDefined();
      expect(enemy.falsePositivePenalty!).toBeGreaterThan(0);
    }
  });

  it('all abilities are from known set', () => {
    for (const enemy of ENEMIES) {
      for (const ability of enemy.abilities) {
        expect(KNOWN_ABILITIES).toContain(ability);
      }
    }
  });

  it('all enemies have a description', () => {
    for (const enemy of ENEMIES) {
      expect(enemy.description.length).toBeGreaterThan(0);
    }
  });
});
