<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            Match
          </th>
          <th class="text-left">
            Odds 1
          </th>
          <th class="text-left">
            Odds X
          </th>
          <th class="text-left">
            Odds 2
          </th>
          <th class="text-left">
            Probability span
          </th>
          <th class="text-left">
            Prediction
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(match, index) in predictions"
          :key="index"
        >
          <td>{{ match.match }}</td>
          <td>{{ match.odds[0] }}</td>
          <td class="text--secondary">{{ match.odds[1] }}</td>
          <td>{{ match.odds[2] }}</td>
          <td>
            <v-progress-linear
              :value="match.probabilitySpan * 100"
              height="16"
            >
              <span>
                {{ match.probabilitySpan.toFixed(2) }}
                <v-icon v-if="match.probabilitySpan < strategy.swapThreshold">mdi-arrow-down</v-icon>
              </span>
            </v-progress-linear>
          </td>
          <td class="font-weight-bold">
            <span class="primary lighten-1 rounded pa-2">{{ match.prediction }}</span>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
  import Vue, { PropType } from 'vue'
  import { getProbabilitySpan, predict } from '../calc/calculations'
  import { PredictionStrategy, MatchResult, MatchWithOdds, MatchPrediction } from '../types'
  import odds from '../../odds-round-16.json'

  export default Vue.extend({
    name: 'Prediction',
    props: {
      strategy: {
        type: Object as PropType<PredictionStrategy>,
        required: true
      },
      dataset: {
        type: Array as PropType<MatchResult[]>,
        required: true
      }
    },
    data() {
      return {
        matches: odds as Pick<MatchWithOdds, 'odds' | 'match'>[]
      }
    },
    computed: {
      matchesWithProbabilitySpan(): MatchWithOdds[] {
        return this.matches.map((match, index) => ({
          ...match,
          round: Math.ceil((index + 1) / 12),
          probabilitySpan: getProbabilitySpan(match.odds)
        } as MatchWithOdds))
      },
      predictions(): MatchPrediction[] {
        return this.matchesWithProbabilitySpan.map((match, index, array) => ({
          ...match,
          prediction: predict(match.odds, match.round as number, this.strategy.predicate, this.strategy.swapThreshold, this.strategy.customStrategyDiff2Ratio, this.strategy.custom, this.dataset, array)
        }))
      }
    }
  })
</script>
