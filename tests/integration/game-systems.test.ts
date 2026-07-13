import { describe, it, expect } from 'vitest';
// Import REAL modules — no mocking
import { calculateDamage, isInRange, selectTarget, calculateBonusDamage, applySlowFactor } from '@/game/logic/combat';
import { calculateKillScore, applyFalsePositivePenalty, calculateAccuracy, calculateFinalScore, calculateWaveBonus, calculateLegitDeliveryBonus } from '@/game/logic/scoring';
import { calculateTowerCost, calculateSellPrice, calculateWaveClearBonus, calculateKillReward, calculateEarlyCallBonus, canAfford } from '@/game/logic/economy';
import { getWaveEnemyCount, getWaveThreatCount, getWaveLegitCount, getScaledHealth, getHealthMultiplier, calculateSpawnDelay } from '@/game/logic/waves';
import { getXPForLevel, getQuestionDifficulty, selectQuestion, isCorrectAnswer } from '@/game/logic/quiz';
import { TOWERS } from '@/game/data/towers';
import { ENEMIES } from '@/game/data/enemies';
import { WAVES } from '@/game/data/waves';
import { QUESTIONS } from '@/game/data/questions';
import { ScoreState } from '@/game/types';

// Build lookup maps from the arrays for convenient access
const TOWER_MAP = Object.fromEntries(TOWERS.map(t => [t.id, t]));
const ENEMY_MAP = Object.fromEntries(ENEMIES.map(e => [e.id, e]));

describe('Full Game Simulation (no mocks)', () => {

  describe('complete wave 1 scenario', () => {
    it('simulates wave 1 with a firewall tower and produces correct score', () => {
      // Setup: player starts with 200 credits, places a firewall (100c)
      let credits = 200;
      const firewallCost = calculateTowerCost(TOWER_MAP.firewall.cost, 0);
      expect(canAfford(credits, firewallCost)).toBe(true);
      credits -= firewallCost;
      expect(credits).toBe(100);

      // Wave 1 spawns enemies
      const wave1 = WAVES[0];
      const totalEnemies = getWaveEnemyCount(wave1);
      const threatCount = getWaveThreatCount(wave1, ENEMY_MAP);
      const legitCount = getWaveLegitCount(wave1, ENEMY_MAP);
      expect(threatCount + legitCount).toBe(totalEnemies);

      // In wave 1, there should be no legitimate traffic
      expect(legitCount).toBe(0);

      // Simulate killing all enemies in wave 1
      let score = 0;
      let threatsKilled = 0;
      wave1.enemies.forEach(entry => {
        const enemyConfig = ENEMY_MAP[entry.type];
        for (let i = 0; i < entry.count; i++) {
          const killScore = calculateKillScore(enemyConfig.id, 1);
          score += killScore;
          credits += calculateKillReward(enemyConfig.reward, 1);
          threatsKilled++;
        }
      });

      // Wave clear bonus
      credits += calculateWaveClearBonus(1);
      score += calculateWaveBonus(1);

      // Verify final state makes sense
      expect(score).toBeGreaterThan(0);
      expect(credits).toBeGreaterThan(100); // earned money from kills + wave bonus
      expect(threatsKilled).toBe(totalEnemies);

      // Accuracy should be perfect (no false positives)
      const accuracy = calculateAccuracy(threatsKilled, 0);
      expect(accuracy).toBe(1.0);

      // Final score with perfect accuracy multiplier
      const state: ScoreState = { score, threatsKilled, threatsLeaked: 0, falsePositives: 0, legitimateDelivered: 0, accuracy, currentWave: 1 };
      const finalScore = calculateFinalScore(state);
      expect(finalScore).toBe(Math.round(score * 1.5)); // 1.5x for perfect accuracy
    });
  });

  describe('false positive scenario', () => {
    it('simulates a WAF hitting legitimate DNS traffic and calculates penalty correctly', () => {
      let score = 1000;
      let threatsKilled = 10;
      let falsePositives = 0;

      // WAF can hit legitimate traffic
      expect(TOWER_MAP.waf.canHitLegitimate).toBe(true);

      // DNS query gets blocked (false positive)
      const dnsConfig = ENEMY_MAP.dns_query;
      expect(dnsConfig.type).toBe('legitimate');

      score = applyFalsePositivePenalty(score, 'dns_query');
      falsePositives++;

      // DNS has the highest penalty (300)
      expect(score).toBe(700);

      // Accuracy drops
      const accuracy = calculateAccuracy(threatsKilled, falsePositives);
      expect(accuracy).toBeCloseTo(10 / 11, 4);

      // Final score is penalized by accuracy multiplier
      const state: ScoreState = { score, threatsKilled, threatsLeaked: 0, falsePositives, legitimateDelivered: 5, accuracy, currentWave: 5 };
      const finalScore = calculateFinalScore(state);
      // accuracy is ~0.909 which is >= 0.9, so 1.2x multiplier
      expect(finalScore).toBe(Math.round(700 * 1.2));
    });

    it('heavy false positives destroy your score even with high kills', () => {
      let score = 5000;
      const threatsKilled = 50;
      let falsePositives = 0;

      // Block 30 legitimate packets (different types)
      for (let i = 0; i < 10; i++) {
        score = applyFalsePositivePenalty(score, 'http_request'); // -200 each
        score = applyFalsePositivePenalty(score, 'dns_query');    // -300 each
        score = applyFalsePositivePenalty(score, 'api_call');     // -250 each
        falsePositives += 3;
      }

      // Score should be 0 (floored)
      expect(score).toBe(0);

      // Accuracy is terrible: 50 / (50 + 30) = 0.625
      const accuracy = calculateAccuracy(threatsKilled, falsePositives);
      expect(accuracy).toBeCloseTo(50 / 80, 4);

      // Final score: 0 * 0.7 = 0 (accuracy between 0.5 and 0.7)
      const state: ScoreState = { score, threatsKilled, threatsLeaked: 0, falsePositives, legitimateDelivered: 0, accuracy, currentWave: 10 };
      expect(calculateFinalScore(state)).toBe(0);
    });
  });

  describe('tower economy full lifecycle', () => {
    it('place, upgrade twice, sell — credits track correctly', () => {
      let credits = 500;
      const tower = TOWER_MAP.ids; // IDS costs 150

      // Place
      const placeCost = calculateTowerCost(tower.cost, 0);
      expect(placeCost).toBe(150);
      credits -= placeCost;
      expect(credits).toBe(350);

      // Upgrade to level 1
      const upgrade1Cost = calculateTowerCost(tower.cost, 1);
      expect(upgrade1Cost).toBe(225); // 150 * 1.5
      credits -= upgrade1Cost;
      expect(credits).toBe(125);

      // Upgrade to level 2
      const upgrade2Cost = calculateTowerCost(tower.cost, 2);
      expect(upgrade2Cost).toBe(375); // 150 * 2.5
      credits -= upgrade2Cost;
      expect(credits).toBe(-250); // Can't afford! This should be blocked by canAfford

      // Actually: canAfford should prevent this
      credits = 125; // reset to before bad upgrade
      expect(canAfford(credits, upgrade2Cost)).toBe(false);

      // Sell at level 1 (invested: 150 + 225 = 375, sell at 70%)
      const sellPrice = calculateSellPrice(tower.cost, 1, 0.7);
      expect(sellPrice).toBe(Math.round(375 * 0.7));
      credits += sellPrice;
      expect(credits).toBe(125 + Math.round(375 * 0.7));
    });
  });

  describe('tower targeting with real data', () => {
    it('firewall ignores legitimate traffic', () => {
      const firewall = TOWER_MAP.firewall;
      expect(firewall.canHitLegitimate).toBe(false);

      const enemies = [
        { position: { x: 100, y: 100 }, distanceOnPath: 0.8, isLegitimate: true, health: 50 },
        { position: { x: 120, y: 100 }, distanceOnPath: 0.5, isLegitimate: false, health: 100 },
      ];

      const target = selectTarget(
        { x: 110, y: 100 },
        firewall.upgrades[0].range,
        enemies,
        firewall.targetingMode,
        firewall.canHitLegitimate
      );

      // Should select index 1 (the threat), not index 0 (legitimate)
      expect(target).toBe(1);
    });

    it('WAF gets bonus damage against SQL injection', () => {
      const waf = TOWER_MAP.waf;
      const baseDamage = calculateDamage(waf.upgrades[0].damage, 0);
      const bonusDamage = calculateBonusDamage(baseDamage, 'sql_injection', waf.bonusVs);
      expect(bonusDamage).toBe(baseDamage * 2);
    });

    it('WAF does NOT get bonus damage against ransomware', () => {
      const waf = TOWER_MAP.waf;
      const baseDamage = calculateDamage(waf.upgrades[0].damage, 0);
      const bonusDamage = calculateBonusDamage(baseDamage, 'ransomware_c2', waf.bonusVs);
      expect(bonusDamage).toBe(baseDamage);
    });

    it('honeypot slow factor keeps enemies above 10% speed', () => {
      const honeypot = TOWER_MAP.honeypot;
      const slowFactor = honeypot.upgrades[2].slowFactor!; // strongest slow
      const enemySpeed = ENEMY_MAP.malware.speed;
      const slowed = applySlowFactor(enemySpeed, slowFactor);
      expect(slowed).toBeGreaterThanOrEqual(enemySpeed * 0.1);
      expect(slowed).toBeLessThan(enemySpeed);
    });
  });

  describe('wave scaling across full game', () => {
    it('enemy health scales 11% per wave — wave 20 enemies are significantly tougher', () => {
      const malwareBaseHP = ENEMY_MAP.malware.health;
      const wave1HP = getScaledHealth(malwareBaseHP, 1);
      const wave10HP = getScaledHealth(malwareBaseHP, 10);
      const wave20HP = getScaledHealth(malwareBaseHP, 20);

      expect(wave1HP).toBe(malwareBaseHP); // no scaling on wave 1
      expect(wave10HP).toBeGreaterThan(wave1HP);
      expect(wave20HP).toBeGreaterThan(wave10HP);

      // Wave 20: health multiplier is 1 + 19*0.11 = 3.09x
      const expectedWave20HP = Math.round(malwareBaseHP * getHealthMultiplier(20));
      expect(wave20HP).toBe(expectedWave20HP);
    });

    it('total enemies across 20 waves is substantial', () => {
      let totalEnemies = 0;
      let totalThreats = 0;
      let totalLegit = 0;

      WAVES.forEach(wave => {
        totalEnemies += getWaveEnemyCount(wave);
        totalThreats += getWaveThreatCount(wave, ENEMY_MAP);
        totalLegit += getWaveLegitCount(wave, ENEMY_MAP);
      });

      expect(totalEnemies).toBeGreaterThan(200); // substantial game length
      expect(totalThreats).toBeGreaterThan(totalLegit); // more threats than legit
      expect(totalLegit).toBeGreaterThan(30); // but meaningful legit count
    });
  });

  describe('quiz system with real questions', () => {
    it('all questions have valid structure', () => {
      QUESTIONS.forEach((q, i) => {
        expect(q.answers.length, `Question ${i} must have 4 answers`).toBe(4);
        expect(q.correct, `Question ${i} correct index must be 0-3`).toBeGreaterThanOrEqual(0);
        expect(q.correct, `Question ${i} correct index must be 0-3`).toBeLessThanOrEqual(3);
        expect([1, 2, 3], `Question ${i} difficulty must be 1-3`).toContain(q.difficulty);
      });
    });

    it('XP requirements escalate and are achievable in 20 waves', () => {
      // A player killing everything should level up multiple times
      let totalXP = 0;
      WAVES.forEach(wave => {
        wave.enemies.forEach(entry => {
          const enemy = ENEMY_MAP[entry.type];
          if (enemy.type === 'threat') {
            totalXP += entry.count * 10; // 10 XP per kill
          }
        });
      });

      // Check how many levels that XP buys
      let level = 1;
      let xpSpent = 0;
      while (xpSpent + getXPForLevel(level) <= totalXP && level < 20) {
        xpSpent += getXPForLevel(level);
        level++;
      }

      // Should reach at least level 3 (to unlock all difficulty tiers)
      expect(level).toBeGreaterThanOrEqual(3);
    });

    it('question selection never repeats until pool exhausted', () => {
      const asked: number[] = [];
      const diff1Questions = QUESTIONS.filter(q => q.difficulty === 1).length;

      for (let i = 0; i < diff1Questions; i++) {
        const idx = selectQuestion(QUESTIONS, 1, asked);
        expect(idx).not.toBeNull();
        expect(asked).not.toContain(idx);
        asked.push(idx!);
      }

      // Pool exhausted
      const exhausted = selectQuestion(QUESTIONS, 1, asked);
      expect(exhausted).toBeNull();
    });
  });

  describe('game balance sanity checks', () => {
    it('starting credits can afford at least 1 tower of each basic type', () => {
      const startCredits = 200;
      expect(canAfford(startCredits, TOWER_MAP.firewall.cost)).toBe(true);
      expect(canAfford(startCredits, TOWER_MAP.honeypot.cost)).toBe(true);
      expect(canAfford(startCredits, TOWER_MAP.rate_limiter.cost)).toBe(true);
    });

    it('expensive towers cannot be afforded at game start', () => {
      const startCredits = 200;
      expect(canAfford(startCredits, TOWER_MAP.packet_inspector.cost)).toBe(false);
    });

    it('all tower damage values can actually kill wave 1 enemies in reasonable shots', () => {
      Object.values(TOWER_MAP).forEach(tower => {
        if (tower.upgrades[0].damage === 0) return; // honeypot does 0 damage at L1
        const damage = calculateDamage(tower.upgrades[0].damage, 0);
        const weakestThreatHP = getScaledHealth(ENEMY_MAP.ddos.health, 1);
        const shotsToKill = Math.ceil(weakestThreatHP / damage);
        expect(shotsToKill, `${tower.id} should kill weakest enemy in <20 shots`).toBeLessThan(20);
      });
    });
  });
});
