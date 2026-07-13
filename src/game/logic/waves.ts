import { Wave, WaveEntry, EnemyConfig } from '../types';

export function getWaveEnemyCount(wave: Wave): number {
  return wave.enemies.reduce((sum, entry) => sum + entry.count, 0);
}

export function getWaveThreatCount(wave: Wave, enemyConfigs: Record<string, EnemyConfig>): number {
  return wave.enemies.reduce((sum, entry) => {
    const config = enemyConfigs[entry.type];
    if (config && config.type === 'threat') return sum + entry.count;
    return sum;
  }, 0);
}

export function getWaveLegitCount(wave: Wave, enemyConfigs: Record<string, EnemyConfig>): number {
  return wave.enemies.reduce((sum, entry) => {
    const config = enemyConfigs[entry.type];
    if (config && config.type === 'legitimate') return sum + entry.count;
    return sum;
  }, 0);
}

export function calculateSpawnDelay(entry: WaveEntry, waveNumber: number): number {
  if (entry.interval !== undefined) return entry.interval;
  return Math.max(400, 1200 - waveNumber * 40);
}

export function getHealthMultiplier(waveNumber: number): number {
  return 1 + (waveNumber - 1) * 0.11;
}

export function getScaledHealth(baseHealth: number, waveNumber: number): number {
  return Math.round(baseHealth * getHealthMultiplier(waveNumber));
}
