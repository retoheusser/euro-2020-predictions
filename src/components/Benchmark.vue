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
            <v-text-field type="number" min="0" max="1" step="0.01" v-model="parameters[index].swapResultBelowProbabilitySpan" />
          </td>
          <td>{{ totalPoints(strategy.dataset) }}</td>
          <td>{{ (totalPoints(strategy.dataset) / strategy.dataset.length).toFixed(2) }}</td>
          <td>
            <v-btn text color="primary">Apply to 2020</v-btn>
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
  import { MatchResult, Strategy, BetPredicateTuple, MatchResultWithBet } from '../types'

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
          betAccordingToOdds: false
        },
        {
          swapResultBelowProbabilitySpan: 0,
          betAccordingToOdds: false
        },
        {
          swapResultBelowProbabilitySpan: 0,
          betAccordingToOdds: false
        },
        {
          swapResultBelowProbabilitySpan: 0,
          betAccordingToOdds: false
        },
        {
          swapResultBelowProbabilitySpan: 0,
          betAccordingToOdds: false
        }]
      }
    },
    computed: {
      strategies(): Strategy[] {
        return [{
          name: 'All 1-0',
          predicate: [1,0] as BetPredicateTuple,
          betFn: getBet
        },
        {
          name: 'Reto\'s custom',
          predicate: [1,0] as BetPredicateTuple,
          betFn: getCustomBet
        },
        {
          name: 'All 2-1',
          predicate: [2,1] as BetPredicateTuple,
          betFn: getBet
        },
        {
          name: 'All 2-0',
          predicate: [2,0] as BetPredicateTuple,
          betFn: getBet
        },
        {
          name: 'All 1-1',
          predicate: [1,1] as BetPredicateTuple,
          betFn: getBet
        }].map((strategy, index) => ({
          ...strategy,
          dataset: this.dataset.map((matchResult) => ({
            ...matchResult,
            bet: strategy.betFn(this.dataset, matchResult, strategy.predicate, this.parameters[index].swapResultBelowProbabilitySpan, this.parameters[index].betAccordingToOdds)
          }))
        }))
      },
      totalPoints() {
        return (dataset: MatchResultWithBet[]): number => {
          return _sum(dataset.map(calculatePoints))
        }
      }
    }
  })
</script>
