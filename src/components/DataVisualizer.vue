<template>
  <v-container>
    <v-card>
      <v-card-title>
        Filters
      </v-card-title>
      <v-card-text>
        <v-input label="Year">
          <v-checkbox v-model="yearFilter" label="2016" :value="2016" class="mr-8" />
          <v-checkbox v-model="yearFilter" label="2012" :value="2012" class="mr-8" />
          <v-checkbox v-model="yearFilter" label="2008" :value="2008" class="mr-8" />
          <v-checkbox v-model="yearFilter" label="2004" :value="2004" class="mr-8" />
        </v-input>
        <v-input label="Stage">
          <v-checkbox v-model="stageFilter" label="Group Stage" value="group" class="mr-8" />
          <v-checkbox v-model="stageFilter" label="KO Stage" value="ko" class="mr-8" />
        </v-input>
        <v-input label="Round">
          <v-checkbox v-model="roundFilter" label="Group Round 1" :value="1" class="mr-8" />
          <v-checkbox v-model="roundFilter" label="Group Round 2" :value="2" class="mr-8" />
          <v-checkbox v-model="roundFilter" label="Group Round 3" :value="3" class="mr-8" />
          <v-checkbox v-model="roundFilter" label="KO" :value="null" class="mr-8" />
        </v-input>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>
        Aggregation
      </v-card-title>
      <v-card-text>
        <v-radio-group v-model="aggregation">
          <v-radio
            label="countBy"
            value="countBy"
          />
          <v-radio
            label="groupBy"
            value="groupBy"
          />
        </v-radio-group>
        <div class="d-flex align-center">
          <v-select
            v-model="aggregationProperty"
            :items="aggregationPropertyCandidates"
            label="Aggregate by"
          />
        </div>
      </v-card-text>
    </v-card>
    <div>Results in selection: {{ filteredResults.length }}</div>
    <div style="white-space: pre;">{{ JSON.stringify(aggregatedResults, null, 2) }}</div>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import _countBy from 'lodash/fp/countBy'
  import _groupBy from 'lodash/fp/groupBy'
  import _orderBy from 'lodash/fp/orderBy'
  import { MatchResult } from '../types'
  import historicResults from '../../data.json'

  type AggregationProperty = 'normalizedResult' | 'oddIsCorrect' | 'total' | 'diff' | null

  export default Vue.extend({
    name: 'DataVisualizer',
    data: () => ({
      historicResults: historicResults as MatchResult[],
      yearFilter: [2016, 2012, 2008, 2004],
      stageFilter: ['group', 'ko'],
      roundFilter: [null, 1, 2, 3],
      aggregation: 'countBy',
      aggregationProperty: null as AggregationProperty | null,
      aggregationPropertyCandidates: ['normalizedResult', 'oddIsCorrect', 'total', 'diff'] as AggregationProperty[]
    }),
    computed: {
      filteredResults(): MatchResult[] {
        return historicResults.filter(result => {
          return this.yearFilter.includes(result.year)
            && this.stageFilter.includes(result.stage)
            && this.roundFilter.includes(result.round)
        })
      },
      aggregatedResults(): Record<string | number, number> {
        if (this.aggregationProperty) {
          const aggregatorFn = this.aggregation === 'countBy' ? _countBy(this.aggregationProperty) : _groupBy(this.aggregationProperty)
          return aggregatorFn(this.filteredResults) as Record<string | number, number>
        } else {
          return {}
        }
      }
    }
  })
</script>
