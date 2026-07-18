export interface ScoreEntry {
  name: string;
  score: number;
  waves: number;
  accuracy: number;
  difficulty: string;
  timestamp: number;
}

const STORAGE_KEY = 'packet_express_scores';
const MAX_ENTRIES = 25;

export class ScoreBoard {
  static getScores(): ScoreEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as ScoreEntry[];
    } catch {
      return [];
    }
  }

  static addScore(entry: ScoreEntry): number {
    const scores = this.getScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const trimmed = scores.slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    // Return rank (1-based)
    return trimmed.findIndex(s => s.timestamp === entry.timestamp) + 1;
  }

  static getTopScores(limit: number = 10): ScoreEntry[] {
    return this.getScores().slice(0, limit);
  }

  static isHighScore(score: number): boolean {
    const scores = this.getScores();
    if (scores.length < MAX_ENTRIES) return true;
    return score > (scores[scores.length - 1]?.score ?? 0);
  }
}
