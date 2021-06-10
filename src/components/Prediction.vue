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
            {{ match.probabilitySpan.toFixed(2) }}
            <v-icon v-if="match.probabilitySpan < strategy.swapThreshold">mdi-arrow-down</v-icon>
          </td>
          <td class="font-weight-bold">{{ match.prediction }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
  import Vue, { PropType } from 'vue'
  import { getProbabilitySpan, predict } from '../calc/calculations'
  import { PredictionStrategy, MatchResult } from '../types'
  import odds from '../../odds.json'

  interface Match {
    match: string;
    odds: number[];
    probabilitySpan?: number;
    round?: number;
  }

  interface MatchPrediction extends Match {
    prediction: string;
  }

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
        matches: odds as Match[]
      }
    },
    computed: {
      matchesWithProbabilitySpan(): Match[] {
        return this.matches.map((match, index) => ({
          ...match,
          round: Math.ceil((index + 1) / 12),
          probabilitySpan: getProbabilitySpan(match.odds)
        }))
      },
      predictions(): MatchPrediction[] {
        return this.matchesWithProbabilitySpan.map((match) => ({
          ...match,
          prediction: predict(match.odds, match.round as number, this.strategy.predicate, this.strategy.swapThreshold, this.strategy.custom, this.dataset)
        }))
      }
    }
  })
</script>
