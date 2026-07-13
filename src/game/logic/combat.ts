import { Position } from '../types';

export function calculateDamage(baseDamage: number, level: number): number {
  return baseDamage * (1 + level * 0.5);
}

export function isInRange(tower: Position, target: Position, range: number): boolean {
  const dx = tower.x - target.x;
  const dy = tower.y - target.y;
  return Math.sqrt(dx * dx + dy * dy) <= range;
}

export function selectTarget(
  towerPos: Position,
  range: number,
  enemies: Array<{ position: Position; distanceOnPath: number; isLegitimate: boolean; health: number }>,
  targetingMode: 'first' | 'closest' | 'strongest' | 'area',
  canHitLegitimate: boolean
): number | null {
  const candidates = enemies
    .map((enemy, index) => ({ enemy, index }))
    .filter(({ enemy }) => {
      if (!canHitLegitimate && enemy.isLegitimate) return false;
      return isInRange(towerPos, enemy.position, range);
    });

  if (candidates.length === 0) return null;

  switch (targetingMode) {
    case 'first':
    case 'area': {
      let best = candidates[0];
      for (let i = 1; i < candidates.length; i++) {
        if (candidates[i].enemy.distanceOnPath > best.enemy.distanceOnPath) {
          best = candidates[i];
        }
      }
      return best.index;
    }
    case 'closest': {
      let best = candidates[0];
      let bestDist = Infinity;
      for (const candidate of candidates) {
        const dx = towerPos.x - candidate.enemy.position.x;
        const dy = towerPos.y - candidate.enemy.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestDist) {
          bestDist = dist;
          best = candidate;
        }
      }
      return best.index;
    }
    case 'strongest': {
      let best = candidates[0];
      for (let i = 1; i < candidates.length; i++) {
        if (candidates[i].enemy.health > best.enemy.health) {
          best = candidates[i];
        }
      }
      return best.index;
    }
  }
}

export function calculateBonusDamage(
  baseDamage: number,
  enemyType: string,
  bonusVs: string[] | undefined
): number {
  if (bonusVs && bonusVs.includes(enemyType)) {
    return baseDamage * 2;
  }
  return baseDamage;
}

export function applySlowFactor(baseSpeed: number, slowFactor: number): number {
  return Math.max(baseSpeed * 0.1, baseSpeed * slowFactor);
}
