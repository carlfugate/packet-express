export interface WaveModifier {
  id: string;
  name: string;
  description: string;
  color: string; // card accent color
  category: 'risk' | 'reward' | 'chaos';
  apply: (config: ModifierContext) => void;
  revert: (config: ModifierContext) => void;
}

export interface ModifierContext {
  // These get mutated by modifiers
  enemyHealthMult: number;
  enemySpeedMult: number;
  enemyCountMult: number;
  creditMultiplier: number;
  scoreMultiplier: number;
  towerDamageMult: number;
  towerRangeMult: number;
  legitTrafficMult: number; // multiplier on legit enemy count
  falsePositivePenaltyMult: number;
}

export function createDefaultModifierContext(): ModifierContext {
  return {
    enemyHealthMult: 1,
    enemySpeedMult: 1,
    enemyCountMult: 1,
    creditMultiplier: 1,
    scoreMultiplier: 1,
    towerDamageMult: 1,
    towerRangeMult: 1,
    legitTrafficMult: 1,
    falsePositivePenaltyMult: 1,
  };
}

export const MODIFIERS: WaveModifier[] = [
  // === RISK (orange) — harder wave, bigger reward ===
  {
    id: 'double_or_nothing',
    name: 'Double or Nothing',
    description: '2x enemy health, 2x credits earned',
    color: '#F47F28',
    category: 'risk',
    apply: (ctx) => {
      ctx.enemyHealthMult = 2;
      ctx.creditMultiplier = 2;
    },
    revert: (ctx) => {
      ctx.enemyHealthMult = 1;
      ctx.creditMultiplier = 1;
    },
  },
  {
    id: 'rush_hour',
    name: 'Rush Hour',
    description: '1.5x enemy speed, 1.5x score for kills',
    color: '#F47F28',
    category: 'risk',
    apply: (ctx) => {
      ctx.enemySpeedMult = 1.5;
      ctx.scoreMultiplier = 1.5;
    },
    revert: (ctx) => {
      ctx.enemySpeedMult = 1;
      ctx.scoreMultiplier = 1;
    },
  },
  {
    id: 'overflow',
    name: 'Overflow',
    description: '1.5x enemy count, +50 bonus credits at wave end',
    color: '#F47F28',
    category: 'risk',
    apply: (ctx) => {
      ctx.enemyCountMult = 1.5;
    },
    revert: (ctx) => {
      ctx.enemyCountMult = 1;
    },
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'All enemies get stealth this wave, 2x score',
    color: '#F47F28',
    category: 'risk',
    apply: (ctx) => {
      ctx.scoreMultiplier = 2;
    },
    revert: (ctx) => {
      ctx.scoreMultiplier = 1;
    },
  },

  // === REWARD (green) — easier wave, some catch ===
  {
    id: 'budget_surplus',
    name: 'Budget Surplus',
    description: '+100 bonus credits now, but no wave clear bonus',
    color: '#84BD00',
    category: 'reward',
    apply: (ctx) => {
      ctx.creditMultiplier = 0; // no wave clear bonus
    },
    revert: (ctx) => {
      ctx.creditMultiplier = 1;
    },
  },
  {
    id: 'overclocked',
    name: 'Overclocked',
    description: '1.5x tower damage, but 1.3x enemy speed',
    color: '#84BD00',
    category: 'reward',
    apply: (ctx) => {
      ctx.towerDamageMult = 1.5;
      ctx.enemySpeedMult = 1.3;
    },
    revert: (ctx) => {
      ctx.towerDamageMult = 1;
      ctx.enemySpeedMult = 1;
    },
  },
  {
    id: 'clear_skies',
    name: 'Clear Skies',
    description: 'No legitimate traffic this wave, but no legit delivery bonus',
    color: '#84BD00',
    category: 'reward',
    apply: (ctx) => {
      ctx.legitTrafficMult = 0;
    },
    revert: (ctx) => {
      ctx.legitTrafficMult = 1;
    },
  },
  {
    id: 'intel_report',
    name: 'Intel Report',
    description: 'All enemies revealed (no stealth), but 0.7x score',
    color: '#84BD00',
    category: 'reward',
    apply: (ctx) => {
      ctx.scoreMultiplier = 0.7;
    },
    revert: (ctx) => {
      ctx.scoreMultiplier = 1;
    },
  },

  // === CHAOS (purple) — unpredictable, wild ===
  {
    id: 'shuffle',
    name: 'Shuffle',
    description: 'Randomize enemy types in the wave (same count)',
    color: '#753BBD',
    category: 'chaos',
    apply: () => {
      // Handled specially by WaveManager
    },
    revert: () => {
      // No context to revert
    },
  },
  {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    description: '2x tower damage, but 2x damage on leak',
    color: '#753BBD',
    category: 'chaos',
    apply: (ctx) => {
      ctx.towerDamageMult = 2;
    },
    revert: (ctx) => {
      ctx.towerDamageMult = 1;
    },
  },
  {
    id: 'packet_storm',
    name: 'Packet Storm',
    description: '2x legit traffic, 2x FP penalty, but 2x delivery bonus',
    color: '#753BBD',
    category: 'chaos',
    apply: (ctx) => {
      ctx.legitTrafficMult = 2;
      ctx.falsePositivePenaltyMult = 2;
    },
    revert: (ctx) => {
      ctx.legitTrafficMult = 1;
      ctx.falsePositivePenaltyMult = 1;
    },
  },
  {
    id: 'budget_cut',
    name: 'Budget Cut',
    description: 'Lose 50 credits, but next tower placed is free',
    color: '#753BBD',
    category: 'chaos',
    apply: () => {
      // Credit deduction handled by GameScene on selection
    },
    revert: () => {
      // One-shot effect, nothing to revert
    },
  },
  {
    id: 'fog_of_war',
    name: 'Fog of War',
    description: 'Tower range -30%, but enemies 20% slower',
    color: '#753BBD',
    category: 'chaos',
    apply: (ctx) => {
      ctx.towerRangeMult = 0.7;
      ctx.enemySpeedMult = 0.8;
    },
    revert: (ctx) => {
      ctx.towerRangeMult = 1;
      ctx.enemySpeedMult = 1;
    },
  },
  {
    id: 'compliance_audit',
    name: 'Compliance Audit',
    description: 'Any FP = -500 this wave, but wave bonus doubled',
    color: '#753BBD',
    category: 'chaos',
    apply: (ctx) => {
      ctx.falsePositivePenaltyMult = 2.5; // effectively makes it ~500 penalty
      ctx.creditMultiplier = 2;
    },
    revert: (ctx) => {
      ctx.falsePositivePenaltyMult = 1;
      ctx.creditMultiplier = 1;
    },
  },
];

export function getRandomModifiers(count: number): WaveModifier[] {
  const shuffled = [...MODIFIERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
