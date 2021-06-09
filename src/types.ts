export interface MatchResult {
  home: number;
  away: number;
  total: number;
  diff: number;
  normalizedResult: string;
  swapped: boolean;
  score: string;
  odds: number[];
  stage: string;
  round: number | null;
  year: number;
  probabilitySpan: number;
  oddIsCorrect: boolean;
}

export interface CountResult {
  key: string;
  count: number;
}

export interface MeanResult {
  key: string;
  mean: number;
}
