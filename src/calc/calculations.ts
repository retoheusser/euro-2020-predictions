import { MatchResultWithBet, MatchResult, BetPredicateTuple, Bet, MatchWithOdds } from '../types'
import _orderBy from 'lodash/fp/orderBy'
import _countBy from 'lodash/fp/countBy'

export function calculatePoints(matchResultWithBet: MatchResultWithBet): number {
  let points = 0
  const { bet, home, away } = matchResultWithBet
  if (home - away === bet.home - bet.away) {
    points += 3 // correct difference
  }
  if (home === bet.home) {
    points += 1 // correct home goals
  }
  if (away === bet.away) {
    points += 1 // correct away goals
  }
  if ((home > away && bet.home > bet.away) || (home < away && bet.home < bet.away) || (home === away && bet.home === bet.away)) {
    points += 5 // correct winner
  }
  return points
}

export function getBet({
  dataset, matchResult, predicate, swapThreshold, customStrategyDiff2Ratio = 0, predictDraws = false, goForMostProbableOutcomeAgainstOdds
}: {
  dataset: MatchResult[] | MatchWithOdds[],
  matchResult: Partial<MatchResult>,
  predicate: BetPredicateTuple,
  swapThreshold: number[],
  customStrategyDiff2Ratio?: number,
  predictDraws?: boolean,
  goForMostProbableOutcomeAgainstOdds: boolean,
}): Bet {
  const [homeOdd, drawOdd, awayOdd] = matchResult.odds as number[]
  const condition = homeOdd <= awayOdd
  const bet = {
    home: condition ? predicate[0] : predicate[1],
    away: condition ? predicate[1] : predicate[0]
  }
  const shouldBetAgainstOdds = (matchResult.round === 1 && matchResult.probabilitySpan as number < swapThreshold[0])
    || (matchResult.round === 2 && matchResult.probabilitySpan as number < swapThreshold[1])
    || (matchResult.round === 3 && matchResult.probabilitySpan as number < swapThreshold[2])

  if (shouldBetAgainstOdds) {
    if (predictDraws) {
      return { home: 1, away: 1 } // fixed bet on draw if against odds
    } else if (goForMostProbableOutcomeAgainstOdds) {
      if ((condition && drawOdd < awayOdd) || (!condition && drawOdd < homeOdd)) {
        return { home: 1, away: 1 } // draw is more likely than swapped result
      } else {
        // swap result
        return {
          home: bet.away,
          away: bet.home
        }
      }
    } else {
      // swap result
      return {
        home: bet.away,
        away: bet.home
      }
    }
  } else {
    return bet
  }
}

export function getCustomBet({
  dataset, matchResult, predicate, swapThreshold, customStrategyDiff2Ratio = 0, localDataset, predictDraws = false, goForMostProbableOutcomeAgainstOdds
}: {
  dataset: MatchResult[],
  matchResult: Partial<MatchResult>,
  predicate: BetPredicateTuple,
  swapThreshold: number[],
  customStrategyDiff2Ratio?: number,
  localDataset?: MatchWithOdds[],
  predictDraws?: boolean,
  goForMostProbableOutcomeAgainstOdds: boolean,
}): Bet {
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
  predicate = expectedDiff === 2 ? [2,0] : (matchResult.round === 2 ? [2,1] : [1,0])
  return getBet({dataset, matchResult, predicate, swapThreshold, predictDraws: predictDraws && matchResult.round === 2, goForMostProbableOutcomeAgainstOdds })
}

export function getProbabilitySpan(odds: number[]): number {
  const sortedProbabilities = [odds[0], odds[2]].map(odd => 1 / odd).sort()
  return sortedProbabilities[1] - sortedProbabilities[0]
}

export function predict({
  odds,
  round,
  predicate,
  swapThreshold,
  customStrategyDiff2Ratio,
  custom,
  dataset,
  localDataset,
  predictDraws,
  goForMostProbableOutcomeAgainstOdds
}: {
  odds: number[],
  round: number,
  predicate: BetPredicateTuple,
  swapThreshold: number[],
  customStrategyDiff2Ratio: number,
  custom: boolean,
  dataset: MatchResult[],
  localDataset: MatchWithOdds[],
  predictDraws: boolean,
  goForMostProbableOutcomeAgainstOdds: boolean
}): string {
  const { home, away } = custom ? getCustomBet({
    dataset, 
    matchResult: {
      odds,
      probabilitySpan: getProbabilitySpan(odds),
      round
    },
    predicate,
    swapThreshold,
    customStrategyDiff2Ratio,
    localDataset,
    predictDraws,
    goForMostProbableOutcomeAgainstOdds
  }) : getBet({
    dataset: [],
    matchResult: {
      odds,
      probabilitySpan: getProbabilitySpan(odds),
      round
    },
    predicate,
    swapThreshold,
    goForMostProbableOutcomeAgainstOdds
  })
  
  return `${home}-${away}`
}