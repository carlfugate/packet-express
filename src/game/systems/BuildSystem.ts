import { TOWERS } from '../data/towers';
import { MAP_DATA } from '../data/maps';
import { canAfford, calculateTowerCost, calculateSellPrice } from '../logic/economy';
import { GAME_CONFIG } from '../config';
import type { TowerConfig } from '../types';

export class BuildSystem {
  private scene: Phaser.Scene;
  private selectedTower: string | null = null;
  private occupiedSlots: Map<string, { towerId: string; level: number }> = new Map();
  private towerConfigMap: Record<string, TowerConfig>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.towerConfigMap = {};
    for (const tower of TOWERS) {
      this.towerConfigMap[tower.id] = tower;
    }
  }

  selectTowerType(towerId: string): void {
    this.selectedTower = towerId;
  }

  clearSelection(): void {
    this.selectedTower = null;
  }

  getSelectedTower(): string | null {
    return this.selectedTower;
  }

  canPlaceAt(slotId: string, credits: number): boolean {
    if (this.occupiedSlots.has(slotId)) return false;
    if (!this.selectedTower) return false;

    const config = this.towerConfigMap[this.selectedTower];
    if (!config) return false;

    const slot = MAP_DATA.towerSlots.find((s) => s.id === slotId);
    if (!slot) return false;

    return canAfford(credits, config.cost);
  }

  placeAt(slotId: string): { towerId: string; cost: number } | null {
    if (!this.selectedTower) return null;

    const config = this.towerConfigMap[this.selectedTower];
    if (!config) return null;

    if (this.occupiedSlots.has(slotId)) return null;

    const slot = MAP_DATA.towerSlots.find((s) => s.id === slotId);
    if (!slot) return null;

    this.occupiedSlots.set(slotId, { towerId: this.selectedTower, level: 1 });

    this.scene.events.emit('tower-placed', {
      slotId,
      towerId: this.selectedTower,
      position: { x: slot.x, y: slot.y },
      config,
      level: 1,
    });

    return { towerId: this.selectedTower, cost: config.cost };
  }

  canUpgrade(slotId: string, credits: number): boolean {
    const slotInfo = this.occupiedSlots.get(slotId);
    if (!slotInfo) return false;

    const config = this.towerConfigMap[slotInfo.towerId];
    if (!config) return false;

    // Already at max level
    if (slotInfo.level >= config.upgrades.length) return false;

    const upgradeCost = calculateTowerCost(config.cost, slotInfo.level);
    return canAfford(credits, upgradeCost);
  }

  upgrade(slotId: string): { cost: number; newLevel: number } | null {
    const slotInfo = this.occupiedSlots.get(slotId);
    if (!slotInfo) return null;

    const config = this.towerConfigMap[slotInfo.towerId];
    if (!config) return null;

    if (slotInfo.level >= config.upgrades.length) return null;

    const cost = calculateTowerCost(config.cost, slotInfo.level);
    slotInfo.level++;
    this.occupiedSlots.set(slotId, slotInfo);

    const slot = MAP_DATA.towerSlots.find((s) => s.id === slotId);

    this.scene.events.emit('tower-upgraded', {
      slotId,
      towerId: slotInfo.towerId,
      position: slot ? { x: slot.x, y: slot.y } : undefined,
      config,
      level: slotInfo.level,
    });

    return { cost, newLevel: slotInfo.level };
  }

  sell(slotId: string): { refund: number } | null {
    const slotInfo = this.occupiedSlots.get(slotId);
    if (!slotInfo) return null;

    const config = this.towerConfigMap[slotInfo.towerId];
    if (!config) return null;

    const refund = calculateSellPrice(
      config.cost,
      slotInfo.level - 1,
      GAME_CONFIG.sellMultiplier,
    );

    this.occupiedSlots.delete(slotId);

    const slot = MAP_DATA.towerSlots.find((s) => s.id === slotId);

    this.scene.events.emit('tower-sold', {
      slotId,
      towerId: slotInfo.towerId,
      position: slot ? { x: slot.x, y: slot.y } : undefined,
      refund,
    });

    return { refund };
  }

  getOccupiedSlots(): Map<string, { towerId: string; level: number }> {
    return this.occupiedSlots;
  }

  getSlotInfo(slotId: string): { towerId: string; level: number } | undefined {
    return this.occupiedSlots.get(slotId);
  }

  getTowerConfig(towerId: string): TowerConfig | undefined {
    return this.towerConfigMap[towerId];
  }

  getAvailableTowers(): TowerConfig[] {
    return TOWERS;
  }
}
