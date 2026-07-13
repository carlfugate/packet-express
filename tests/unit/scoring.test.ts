import { describe, it, expect } from 'vitest';
import {
  calculateKillScore,
  calculateFalsePositivePenalty,
  applyFalsePositivePenalty,
  calculateLegitDeliveryBonus,
  calculateAccuracy,
  calculateWaveBonus,
  calculateFinalScore,
} from '../../src/game/logic/scoring';
import { ScoreState } from '../../src/game/types';

describe('scoring logic', () => {
  describe('calculateKillScore', () => {
    it('returns base score for wave 1-5 (multiplier 1)', () => {
      expect(calculateKillScore('malware', 1)).toBe(100);
      expect(calculateKillScore('malware', 5)).toBe(100);
    });

    it('applies wave multiplier of 2 for waves 6-10', () => {
      expect(calculateKillScore('malware', 6)).toBe(200);
      expect(calculateKillScore('malware', 10)).toBe(200);
    });

    it('applies wave multiplier of 3 for waves 11-15', () => {
      expect(calculateKillScore('ddos', 11)).toBe(150);
    });

    it('returns correct scores for all enemy types at wave 1', () => {
      expect(calculateKillScore('malware', 1)).toBe(100);
      expect(calculateKillScore('ddos', 1)).toBe(50);
      expect(calculateKillScore('phishing', 1)).toBe(150);
      expect(calculateKillScore('sql_injection', 1)).toBe(200);
      expect(calculateKillScore('ransomware_c2', 1)).toBe(350);
      expect(calculateKillScore('zero_day', 1)).toBe(500);
    });

    it('returns 0 for unknown enemy types', () => {
      expect(calculateKillScore('unknown_type', 1)).toBe(0);
    });
  });

  describe('calculateFalsePositivePenalty', () => {
    it('returns correct penalty for http_request', () => {
      expect(calculateFalsePositivePenalty('http_request')).toBe(200);
    });

    it('returns correct penalty for dns_query', () => {
      expect(calculateFalsePositivePenalty('dns_query')).toBe(300);
    });

    it('returns correct penalty for api_call', () => {
      expect(calculateFalsePositivePenalty('api_call')).toBe(250);
    });

    it('returns correct penalty for email', () => {
      expect(calculateFalsePositivePenalty('email')).toBe(150);
    });

    it('returns 0 for unknown types', () => {
      expect(calculateFalsePositivePenalty('unknown')).toBe(0);
    });
  });

  describe('applyFalsePositivePenalty', () => {
    it('subtracts penalty from current score', () => {
      expect(applyFalsePositivePenalty(500, 'http_request')).toBe(300);
    });

    it('floors at 0 when penalty exceeds score', () => {
      expect(applyFalsePositivePenalty(100, 'dns_query')).toBe(0);
    });

    it('returns current score for unknown legit types (0 penalty)', () => {
      expect(applyFalsePositivePenalty(500, 'unknown')).toBe(500);
    });
  });

  describe('calculateLegitDeliveryBonus', () => {
    it('returns flat 25 points regardless of type', () => {
      expect(calculateLegitDeliveryBonus('http_request')).toBe(25);
      expect(calculateLegitDeliveryBonus('dns_query')).toBe(25);
      expect(calculateLegitDeliveryBonus('api_call')).toBe(25);
      expect(calculateLegitDeliveryBonus('email')).toBe(25);
    });
  });

  describe('calculateAccuracy', () => {
    it('returns 1.0 when no threats killed and no false positives', () => {
      expect(calculateAccuracy(0, 0)).toBe(1.0);
    });

    it('returns 1.0 when perfect accuracy (no false positives)', () => {
      expect(calculateAccuracy(10, 0)).toBe(1.0);
    });

    it('returns 0.5 when equal kills and false positives', () => {
      expect(calculateAccuracy(5, 5)).toBe(0.5);
    });

    it('calculates correct ratio', () => {
      expect(calculateAccuracy(9, 1)).toBeCloseTo(0.9);
      expect(calculateAccuracy(7, 3)).toBeCloseTo(0.7);
    });
  });

  describe('calculateWaveBonus', () => {
    it('returns 75 for wave 1', () => {
      expect(calculateWaveBonus(1)).toBe(75);
    });

    it('returns 100 for wave 2', () => {
      expect(calculateWaveBonus(2)).toBe(100);
    });

    it('scales linearly with wave number', () => {
      expect(calculateWaveBonus(10)).toBe(300);
    });
  });

  describe('calculateFinalScore', () => {
    it('applies 1.5x multiplier for perfect accuracy', () => {
      const state: ScoreState = {
        score: 1000,
        threatsKilled: 10,
        threatsLeaked: 0,
        falsePositives: 0,
        legitimateDelivered: 5,
        accuracy: 1.0,
        currentWave: 5,
      };
      expect(calculateFinalScore(state)).toBe(1500);
    });

    it('applies 1.2x multiplier for 90%+ accuracy', () => {
      const state: ScoreState = {
        score: 1000,
        threatsKilled: 9,
        threatsLeaked: 0,
        falsePositives: 1,
        legitimateDelivered: 5,
        accuracy: 0.9,
        currentWave: 5,
      };
      expect(calculateFinalScore(state)).toBe(1200);
    });

    it('applies 1.0x multiplier for 70%+ accuracy', () => {
      const state: ScoreState = {
        score: 1000,
        threatsKilled: 7,
        threatsLeaked: 0,
        falsePositives: 3,
        legitimateDelivered: 5,
        accuracy: 0.7,
        currentWave: 5,
      };
      expect(calculateFinalScore(state)).toBe(1000);
    });

    it('applies 0.7x multiplier for 50%+ accuracy', () => {
      const state: ScoreState = {
        score: 1000,
        threatsKilled: 5,
        threatsLeaked: 0,
        falsePositives: 5,
        legitimateDelivered: 5,
        accuracy: 0.5,
        currentWave: 5,
      };
      expect(calculateFinalScore(state)).toBe(700);
    });

    it('applies 0.5x multiplier for below 50% accuracy', () => {
      const state: ScoreState = {
        score: 1000,
        threatsKilled: 3,
        threatsLeaked: 0,
        falsePositives: 7,
        legitimateDelivered: 5,
        accuracy: 0.3,
        currentWave: 5,
      };
      expect(calculateFinalScore(state)).toBe(500);
    });

    it('rounds the final score', () => {
      const state: ScoreState = {
        score: 333,
        threatsKilled: 10,
        threatsLeaked: 0,
        falsePositives: 0,
        legitimateDelivered: 5,
        accuracy: 1.0,
        currentWave: 5,
      };
      expect(calculateFinalScore(state)).toBe(500); // 333 * 1.5 = 499.5 rounds to 500
    });
  });
});
