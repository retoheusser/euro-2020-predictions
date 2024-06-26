<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            Strategy
          </th>
          <th class="text-left">
            Swap result below probability span round 1
          </th>
          <th class="text-left">
            Swap result below probability span round 2
          </th>
          <th class="text-left">
            Swap result below probability span round 3
          </th>
          <th class="text-left">
            Diff 2 ratio (custom strategy)
          </th>
          <th class="text-left">
            Total points
          </th>
          <th class="text-left">
            Points per game
          </th>
          <th class="text-left">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(strategy, index) in strategies"
          :key="strategy.name"
        >
          <td>{{ strategy.name }}</td>
          <td>
            <v-text-field type="number" min="0" max="1" step="0.01" :value="parameters[index].swapResultBelowProbabilitySpan[0]" @input="(value) => swapResultBetweenProbabilitySpanInput(Number(value), index, 0)"/>
          </td>
          <td>
            <v-text-field type="number" min="0" max="1" step="0.01" :value="parameters[index].swapResultBelowProbabilitySpan[1]" @input="(value) => swapResultBetweenProbabilitySpanInput(Number(value), index, 1)"/>
          </td>
          <td>
            <v-text-field type="number" min="0" max="1" step="0.01" :value="parameters[index].swapResultBelowProbabilitySpan[2]" @input="(value) => swapResultBetweenProbabilitySpanInput(Number(value), index, 2)"/>
          </td>
          <td>
            <v-text-field type="number" min="0" max="1" step="0.01" :value="parameters[index].customStrategyDiff2Ratio" @input="(value) => parameters[index].customStrategyDiff2Ratio = Number(value)" />
          </td>
          <td>{{ totalPoints(strategy.dataset) }}</td>
          <td style="width: 100%">
            <v-progress-linear
              :value="(pointsPerGame(strategy.dataset) - minPointsPerGameInTable) / (maxPointsPerGameInTable - minPointsPerGameInTable) * 100"
              height="16"
            >
              <span>
                {{ pointsPerGame(strategy.dataset).toFixed(2) }}
              </span>
            </v-progress-linear>
          </td>
          <td>
            <v-btn text color="primary" @click="applyStrategy(strategy, parameters[index].swapResultBelowProbabilitySpan, parameters[index].customStrategyDiff2Ratio)">Apply to 2024</v-btn>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
  import Vue, { PropType } from 'vue'
  import _sum from 'lodash/fp/sum'
  import { calculatePoints, getBet, getCustomBet } from '../calc/calculations'
  import { MatchResult, Strategy, BetPredicateTuple, MatchResultWithBet, PredictionStrategy } from '../types'

  export default Vue.extend({
    name: 'Benchmark',
    props: {
      dataset: {
        type: Array as PropType<MatchResult[]>,
        required: true
      }
    },
    data() {
      return {
        parameters: [{
          swapResultBelowProbabilitySpan: [0, 0, 0],
          customStrategyDiff2Ratio: 0
        },
        {
          swapResultBelowProbabilitySpan: [0, 0, 0],
          customStrategyDiff2Ratio: 0
        },
        {
          swapResultBelowProbabilitySpan: [0, 0, 0],
          customStrategyDiff2Ratio: 0
        },
        {
          swapResultBelowProbabilitySpan: [0, 0, 0],
          customStrategyDiff2Ratio: 0
        },{
          swapResultBelowProbabilitySpan: [0, 0, 0],
          customStrategyDiff2Ratio: 0
        },
        {
          swapResultBelowProbabilitySpan: [0, 0, 0],
          customStrategyDiff2Ratio: 0
        }]
      }
    },
    computed: {
      strategies(): Strategy[] {
        return [{
          name: 'Reto\'s custom',
          predicate: [1,0] as BetPredicateTuple,
          custom: true,
          predictDraws: false,
          goForMostProbableOutcomeAgainstOdds: false,
          betFn: getCustomBet
        },{
          name: 'Reto\'s custom with 1:1',
          predicate: [1,0] as BetPredicateTuple,
          custom: true,
          predictDraws: true,
          goForMostProbableOutcomeAgainstOdds: false,
          betFn: getCustomBet
        },
        {
          name: 'Reto\'s custom with most probable outcome against odds',
          predicate: [1,0] as BetPredicateTuple,
          custom: true,
          predictDraws: false,
          goForMostProbableOutcomeAgainstOdds: true,
          betFn: getCustomBet
        },
        {
          name: 'All 1-0',
          predicate: [1,0] as BetPredicateTuple,
          custom: false,
          predictDraws: false,
          goForMostProbableOutcomeAgainstOdds: false,
          betFn: getBet
        },
        {
          name: 'All 2-1',
          predicate: [2,1] as BetPredicateTuple,
          custom: false,
          predictDraws: false,
          goForMostProbableOutcomeAgainstOdds: false,
          betFn: getBet
        },
        {
          name: 'All 2-0',
          predicate: [2,0] as BetPredicateTuple,
          custom: false,
          predictDraws: false,
          goForMostProbableOutcomeAgainstOdds: false,
          betFn: getBet
        }].map((strategy, index) => ({
          ...strategy,
          dataset: this.dataset.map((matchResult) => ({
            ...matchResult,
            bet: strategy.betFn({
              dataset: this.dataset,
              matchResult,
              predicate: strategy.predicate,
              swapThreshold: this.parameters[index].swapResultBelowProbabilitySpan,
              customStrategyDiff2Ratio: this.parameters[index].customStrategyDiff2Ratio,
              predictDraws: strategy.predictDraws,
              goForMostProbableOutcomeAgainstOdds: strategy.goForMostProbableOutcomeAgainstOdds
            })
          }))
        }))
      },
      totalPoints() {
        return (dataset: MatchResultWithBet[]): number => {
          return _sum(dataset.map(calculatePoints))
        }
      },
      pointsPerGame() {
        return (dataset: MatchResultWithBet[]): number => {
          return this.totalPoints(dataset) / dataset.length
        }
      },
      maxPointsPerGameInTable(): number {
        const strategies = this.strategies
        return Math.max(...strategies.map(({dataset}) => this.pointsPerGame(dataset)))
      },
      minPointsPerGameInTable(): number {
        const strategies = this.strategies
        return Math.min(...strategies.map(({dataset}) => this.pointsPerGame(dataset)))
      }
    },
    methods: {
      applyStrategy({ custom, predicate, predictDraws, goForMostProbableOutcomeAgainstOdds }: Strategy, swapThreshold: number[], customStrategyDiff2Ratio: number): void {
        const predictionStrategy: PredictionStrategy = {
          custom,
          predicate,
          swapThreshold,
          customStrategyDiff2Ratio,
          predictDraws,
          goForMostProbableOutcomeAgainstOdds
        }
        this.$emit('apply', predictionStrategy)
      },
      swapResultBetweenProbabilitySpanInput(value: number, strategy: number, index: number) {
        Vue.set(this.parameters[strategy].swapResultBelowProbabilitySpan, index, value)
      }
    }
  })
</script>
