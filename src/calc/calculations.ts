import { MatchResultWithBet, MatchResult, BetPredicateTuple, Bet } from '../types'

export function calculatePoints(matchResultWithBet: MatchResultWithBet): number {
  let points = 0
  const { bet, home, away } = matchResultWithBet
  if (home - away === bet.home - bet.away) {
    points += 1
  }
  if (home === bet.home) {
    points += 2
  }
  if (away === bet.away) {
    points += 2
  }
  if ((home > away && bet.home > bet.away) || (home < away && bet.home < bet.away) || (home === away && bet.home === bet.away)) {
    points +=5
  }
  return points
}

export function getBet(dataset: MatchResult[], matchResult: MatchResult, predicate: BetPredicateTuple, swapThreshold: number): Bet {
  return matchResult.probabilitySpan > swapThreshold ? {
    home: predicate[0],
    away: predicate[1]
  } : {
    home: predicate[1],
    away: predicate[0]
  }
}

export function getCustomBet(dataset: MatchResult[], matchResult: MatchResult, predicate: BetPredicateTuple, swapThreshold: number): Bet {
  predicate = matchResult.round === 2 ? [2,1] : [0,1]
  return matchResult.probabilitySpan > swapThreshold ? {
    home: predicate[0],
    away: predicate[1]
  } : {
    home: predicate[1],
    away: predicate[0]
  }
}