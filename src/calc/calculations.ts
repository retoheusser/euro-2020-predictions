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

// TODO: this assumes the right winner
// TODO: bet according to odds
export function getBet(dataset: MatchResult[], matchResult: MatchResult, predicate: BetPredicateTuple, swapThreshold: number, accordingToOdds: boolean): Bet {
  const { home, away } = matchResult
  const [homeOdd, , awayOdd] = matchResult.odds
  const condition = accordingToOdds ? (homeOdd <= awayOdd) : (home >= away)
  const bet = {
    home: condition ? predicate[0] : predicate[1],
    away: condition ? predicate[1] : predicate[0]
  }
  
  return matchResult.probabilitySpan > swapThreshold ? bet : {
    home: bet.away,
    away: bet.home
  }
}

export function getCustomBet(dataset: MatchResult[], matchResult: MatchResult, predicate: BetPredicateTuple, swapThreshold: number, accordingToOdds: boolean): Bet {
  predicate = matchResult.round === 2 ? [2,1] : [1,0]
  return getBet(dataset, matchResult, predicate, swapThreshold, accordingToOdds)
}