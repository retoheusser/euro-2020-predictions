import { MatchResultWithBet, MatchResult, BetPredicateTuple, Bet, MatchWithOdds } from '../types'
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
    points += 5
  }
  return points
}

export function getBet(dataset: MatchResult[] | MatchWithOdds[], matchResult: Partial<MatchResult>, predicate: BetPredicateTuple, swapThreshold: number, customStrategyDiff2Ratio = 0): Bet {
  const [homeOdd, , awayOdd] = matchResult.odds as number[]
  const condition = homeOdd <= awayOdd
  const bet = {
    home: condition ? predicate[0] : predicate[1],
    away: condition ? predicate[1] : predicate[0]
  }
  
  return matchResult.probabilitySpan as number > swapThreshold ? bet : {
    home: bet.away,
    away: bet.home
  }
}

export function getCustomBet(dataset: MatchResult[], matchResult: Partial<MatchResult>, predicate: BetPredicateTuple, swapThreshold: number, customStrategyDiff2Ratio = 0, localDataset?: MatchWithOdds[]): Bet {
  const orderByProbabilitySpan = _orderBy<MatchResult | MatchWithOdds>(({ probabilitySpan }) => probabilitySpan, 'desc')
  const countByDiff = _countBy('diff')
  const datasetLength = (localDataset || dataset).length
  const orderedDataSet: (MatchResult | MatchWithOdds)[] = orderByProbabilitySpan(localDataset || dataset)
  
  let thresholdProbabilitySpan = 1
  if (customStrategyDiff2Ratio) {
    const diff2amount = Math.ceil((customStrategyDiff2Ratio * datasetLength) - 1)
    thresholdProbabilitySpan = orderedDataSet[diff2amount].probabilitySpan
  } else {
    const diffCounts = countByDiff(dataset)
    const diff1Frequency = diffCounts['1']
    const diff2Frequency = diffCounts['2']
    const totalCandidates = diff1Frequency + diff2Frequency
    const diff2Share = diff2Frequency / totalCandidates
    const thresholdIndex = Math.ceil((diff2Share * datasetLength) - 1)
    thresholdProbabilitySpan = orderedDataSet[thresholdIndex].probabilitySpan
  }
  
  // mix in some 2-0 results according to their share of all results
  const expectedDiff = matchResult.probabilitySpan as number >= thresholdProbabilitySpan ? 2 : 1
  predicate = expectedDiff === 2 ? [2,0]  : (matchResult.round === 2 ? [2,1] : [1,0])
  return getBet(dataset, matchResult, predicate, swapThreshold)
}

export function getProbabilitySpan(odds: number[]): number {
  const sortedProbabilities = odds.map(odd => 1 / odd).sort()
  return sortedProbabilities[2] - sortedProbabilities[0]
}

export function predict(odds: number[], round: number, predicate: BetPredicateTuple, swapThreshold: number, customStrategyDiff2Ratio: number, custom: boolean, dataset: MatchResult[], localDataset: MatchWithOdds[]): string {
  const { home, away } = custom ? getCustomBet(dataset, {
    odds,
    probabilitySpan: getProbabilitySpan(odds),
    round
  }, predicate, swapThreshold, customStrategyDiff2Ratio, localDataset) : getBet([], {
    odds,
    probabilitySpan: getProbabilitySpan(odds),
    round
  }, predicate, swapThreshold)
  
  return `${home}-${away}`
}