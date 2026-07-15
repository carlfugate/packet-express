import { ScoreState } from '../types';

const KILL_SCORES: Record<string, number> = {
  malware: 100,
  ddos: 50,
  phishing: 150,
  sql_injection: 200,
  ransomware_c2: 350,
  zero_day: 500,
  modbus_exploit: 400,
  firmware_worm: 350,
  signal_jammer: 300,
};

const FALSE_POSITIVE_PENALTIES: Record<string, number> = {
  http_request: 200,
  dns_query: 300,
  api_call: 250,
  email: 150,
  plc_heartbeat: 500,
  scada_telemetry: 400,
  track_switch_cmd: 600,
  train_position: 350,
};

export function calculateKillScore(enemyType: string, waveNumber: number): number {
  const base = KILL_SCORES[enemyType] ?? 0;
  const multiplier = Math.ceil(waveNumber / 5);
  return base * multiplier;
}

export function calculateFalsePositivePenalty(legitType: string): number {
  return FALSE_POSITIVE_PENALTIES[legitType] ?? 0;
}

export function applyFalsePositivePenalty(currentScore: number, legitType: string): number {
  const penalty = calculateFalsePositivePenalty(legitType);
  return Math.max(0, currentScore - penalty);
}

export function calculateLegitDeliveryBonus(legitType: string): number {
  return 25;
}

export function calculateAccuracy(threatsKilled: number, falsePositives: number): number {
  if (threatsKilled === 0 && falsePositives === 0) return 1.0;
  return threatsKilled / (threatsKilled + falsePositives);
}

export function calculateWaveBonus(waveNumber: number): number {
  return 50 + waveNumber * 25;
}

export function calculateFinalScore(state: ScoreState): number {
  const accuracy = calculateAccuracy(state.threatsKilled, state.falsePositives);
  let multiplier: number;
  if (accuracy >= 1.0) {
    multiplier = 1.5;
  } else if (accuracy >= 0.9) {
    multiplier = 1.2;
  } else if (accuracy >= 0.7) {
    multiplier = 1.0;
  } else if (accuracy >= 0.5) {
    multiplier = 0.7;
  } else {
    multiplier = 0.5;
  }
  return Math.round(state.score * multiplier);
}
