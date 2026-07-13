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
} as const;
