export interface DifficultyConfig {
  id: 'easy' | 'normal' | 'hard';
  name: string;
  description: string;
  healthMultiplier: number;
  speedMultiplier: number;
  startingCredits: number;
  startingBandwidth: number;
  enemyCountMultiplier: number;
  falsePositivePenaltyMultiplier: number;
  waveDelay: number;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    name: 'Analyst',
    description: 'Learning the ropes. More resources, slower enemies.',
    healthMultiplier: 0.75,
    speedMultiplier: 0.8,
    startingCredits: 300,
    startingBandwidth: 15,
    enemyCountMultiplier: 0.8,
    falsePositivePenaltyMultiplier: 0.5,
    waveDelay: 7000,
  },
  {
    id: 'normal',
    name: 'Engineer',
    description: 'Standard operational tempo.',
    healthMultiplier: 1.0,
    speedMultiplier: 1.0,
    startingCredits: 200,
    startingBandwidth: 10,
    enemyCountMultiplier: 1.0,
    falsePositivePenaltyMultiplier: 1.0,
    waveDelay: 5000,
  },
  {
    id: 'hard',
    name: 'Incident Commander',
    description: 'Active breach. Fast threats, tight budget, zero margin.',
    healthMultiplier: 1.4,
    speedMultiplier: 1.25,
    startingCredits: 150,
    startingBandwidth: 7,
    enemyCountMultiplier: 1.3,
    falsePositivePenaltyMultiplier: 1.5,
    waveDelay: 3500,
  },
];

export const GAME_CONFIG = {
  title: 'Packet Express',
  subtitle: 'Defend the Network',
  currency: 'Credits',
  lives: 10,
  livesLabel: 'Bandwidth',
  startingMoney: 200,
  sellMultiplier: 0.7,
  colors: {
    primary: '#0076A8',
    secondary: '#84BD00',
    accent: '#F47F28',
    danger: '#D9534F',
    safe: '#5EA500',
    background: '#0A1628',
    ui: '#044872',
  },
  falsePositive: {
    enabled: true,
    penaltyMultiplier: 1.0,
    graceWaves: 3,
  },
  otZone: {
    enabled: true,
    boundaryWaypointIndex: 10, // After waypoint 10 (halfway through the snake), enemies enter OT zone
    damageMultiplier: 3, // Threats in OT zone cost 3 bandwidth instead of 1
    ransomwareDamage: 5, // Ransomware reaching OT end = 5 bandwidth
  },
} as const;
