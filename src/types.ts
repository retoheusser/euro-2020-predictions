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

export type BetPredicateTuple = [number, number]
export interface MatchResultWithBet extends MatchResult {
  bet: Bet;
  points?: number;
}
export interface Strategy {
  name: string;
  dataset: MatchResultWithBet[];
  predicate: BetPredicateTuple;
  custom: boolean;
  betFn: (...args: any) => Bet
}

export interface PredictionStrategy {
  predicate: BetPredicateTuple;
  custom: boolean;
  swapThreshold: number;
  customStrategyDiff2Ratio: number;
}

export interface Bet {
  home: number;
  away: number;
}