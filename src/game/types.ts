export interface Position {
  x: number;
  y: number;
}

export interface TowerConfig {
  id: string;
  name: string;
  description: string;
  cost: number;
  targetingMode: 'first' | 'closest' | 'strongest' | 'area';
  canHitLegitimate: boolean;
  reveals?: boolean;
  bonusVs?: string[];
  upgrades: TowerUpgrade[];
}

export interface TowerUpgrade {
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  slowFactor?: number;
  description: string;
}

export interface EnemyConfig {
  id: string;
  name: string;
  type: 'threat' | 'legitimate';
  health: number;
  speed: number;
  reward: number;
  scoreValue: number;
  falsePositivePenalty?: number;
  otDamage?: number; // Override damage when reaching end in OT zone
  description: string;
  abilities: string[];
}

export interface WaveEntry {
  type: string;
  count: number;
  interval?: number;
}

export interface Wave {
  wave: number;
  enemies: WaveEntry[];
  bonus: number;
}

export interface ScoreState {
  score: number;
  threatsKilled: number;
  threatsLeaked: number;
  falsePositives: number;
  legitimateDelivered: number;
  accuracy: number;
  currentWave: number;
}

export interface GameAction {
  tick: number;
  type: 'place_tower' | 'upgrade' | 'sell' | 'call_wave' | 'quiz_answer';
  data: Record<string, unknown>;
}
