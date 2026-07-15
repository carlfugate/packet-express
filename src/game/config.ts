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
