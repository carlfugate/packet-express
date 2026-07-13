export function calculateTowerCost(baseCost: number, upgradeLevel: number): number {
  const multipliers = [1, 1.5, 2.5];
  return Math.round(baseCost * (multipliers[upgradeLevel] ?? multipliers[0]));
}

export function calculateSellPrice(baseCost: number, currentLevel: number, sellMultiplier: number): number {
  const multipliers = [1, 1.5, 2.5];
  let totalInvested = 0;
  for (let i = 0; i <= currentLevel; i++) {
    totalInvested += Math.round(baseCost * (multipliers[i] ?? multipliers[0]));
  }
  return Math.round(totalInvested * sellMultiplier);
}

export function calculateKillReward(baseReward: number, waveNumber: number): number {
  return baseReward;
}

export function calculateWaveClearBonus(waveNumber: number): number {
  return 28 + waveNumber * 3;
}

export function calculateEarlyCallBonus(waveNumber: number, remainingCountdownSeconds: number): number {
  return Math.round(remainingCountdownSeconds * 2);
}

export function canAfford(currentCredits: number, cost: number): boolean {
  return currentCredits >= cost;
}
