<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            Strategy
          </th>
          <th class="text-left">
            Bet according to odds
          </th>
          <th class="text-left">
            Swap result below probability span
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
            <v-checkbox v-model="parameters[index].betAccordingToOdds" />
          </td>
          <td>
            <v-text-field type="number" min="0" max="1" step="0.01" :value="parameters[index].swapResultBelowProbabilitySpan" @input="(value) => parameters[index].swapResultBelowProbabilitySpan = Number(value)"/>
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
            <v-btn text color="primary" @click="applyStrategy(strategy, parameters[index].swapResultBelowProbabilitySpan, parameters[index].customStrategyDiff2Ratio)">Apply to 2020</v-btn>
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
          swapResultBelowProbabilitySpan: 0,
          customStrategyDiff2Ratio: 0,
          betAccordingToOdds: true
        },
        {
          swapResultBelowProbabilitySpan: 0,
          customStrategyDiff2Ratio: 0,
          betAccordingToOdds: true
        },
        {
          swapResultBelowProbabilitySpan: 0,
          customStrategyDiff2Ratio: 0,
          betAccordingToOdds: true
        },
        {
          swapResultBelowProbabilitySpan: 0,
          customStrategyDiff2Ratio: 0,
          betAccordingToOdds: true
        }]
      }
    },
    computed: {
      strategies(): Strategy[] {
        return [{
          name: 'Reto\'s custom',
          predicate: [1,0] as BetPredicateTuple,
          custom: true,
          betFn: getCustomBet
        },{
          name: 'All 1-0',
          predicate: [1,0] as BetPredicateTuple,
          custom: false,
          betFn: getBet
        },
        {
          name: 'All 2-1',
          predicate: [2,1] as BetPredicateTuple,
          custom: false,
          betFn: getBet
        },
        {
          name: 'All 2-0',
          predicate: [2,0] as BetPredicateTuple,
          custom: false,
          betFn: getBet
        }].map((strategy, index) => ({
          ...strategy,
          dataset: this.dataset.map((matchResult) => ({
            ...matchResult,
            bet: strategy.betFn(this.dataset, matchResult, strategy.predicate, this.parameters[index].swapResultBelowProbabilitySpan, this.parameters[index].betAccordingToOdds, this.parameters[index].customStrategyDiff2Ratio)
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
      applyStrategy({ custom, predicate }: Strategy, swapThreshold: number, customStrategyDiff2Ratio: number): void {
        const predictionStrategy: PredictionStrategy = {
          custom,
          predicate,
          swapThreshold,
          customStrategyDiff2Ratio
        }
        this.$emit('apply', predictionStrategy)
      }
    }
  })
</script>
