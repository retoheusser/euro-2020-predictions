import { MatchResultWithBet, MatchResult, BetPredicateTuple, Bet } from '../types'
import _orderBy from 'lodash/fp/orderBy'
import _countBy from 'lodash/fp/countBy'

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
  const orderByProbabilitySpan = _orderBy<MatchResult>(({ probabilitySpan }) => probabilitySpan, 'desc')
  const countByDiff = _countBy('diff')
  
  const diffCounts = countByDiff(dataset)
  const diff1Frequency = diffCounts['1']
  const diff2Frequency = diffCounts['2']
  const totalCandidates = diff1Frequency + diff2Frequency
  const diff2Share = diff2Frequency / totalCandidates
  const diff2amount = diff2Share * dataset.length
  const thresholdProbabilitySpan = orderByProbabilitySpan(dataset)[Math.floor(diff2amount)].probabilitySpan

  // mix in some 2-0 results according to their share of all results
  const expectedDiff = matchResult.probabilitySpan > thresholdProbabilitySpan ? 2 : 1
  predicate = expectedDiff === 2 ? [2,0]  : (matchResult.round === 2 ? [2,1] : [1,0])
  return getBet(dataset, matchResult, predicate, swapThreshold, accordingToOdds)
}

export function getProbabilitySpan(odds: number[]): number {
  const sortedProbabilities = odds.map(odd => 1 / odd).sort()
  return sortedProbabilities[2] - sortedProbabilities[0]
}

export function predict(odds: number[], predicate: BetPredicateTuple, swapThreshold: number, custom: boolean): string {
  return `${predicate[0]}-${predicate[1]}`
}