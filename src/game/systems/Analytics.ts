/**
 * Lightweight analytics via GoatCounter custom events.
 * No cookies, no PII, GDPR-compliant.
 */
export class Analytics {
  static track(event: string, data?: Record<string, string | number>): void {
    const goatcounter = (window as any).goatcounter;
    if (!goatcounter?.count) return;

    let path = `/event/${event}`;
    if (data) {
      const params = Object.entries(data)
        .map(([k, v]) => `${k}-${v}`)
        .join('/');
      path += `/${params}`;
    }

    goatcounter.count({ path, event: true });
  }

  static gameStart(difficulty: string): void {
    this.track('game-start', { difficulty });
  }

  static gameOver(victory: boolean, score: number, waves: number, accuracy: number, difficulty: string): void {
    this.track('game-over', {
      result: victory ? 'win' : 'loss',
      score: Math.round(score),
      waves,
      accuracy: Math.round(accuracy * 100),
      difficulty,
    });
  }

  static towerPlaced(towerType: string): void {
    this.track('tower-placed', { type: towerType });
  }

  static abilityUsed(abilityId: string): void {
    this.track('ability-used', { id: abilityId });
  }

  static modifierChosen(modifierId: string): void {
    this.track('modifier-chosen', { id: modifierId });
  }

  static waveReached(wave: number, difficulty: string): void {
    this.track('wave-reached', { wave, difficulty });
  }
}
