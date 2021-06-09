<template>
  <v-container>
    <v-row>
      <v-col>
      <v-card class="ma-4">
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
          <v-checkbox v-model="excludeDraws" label="Exclude Draws" />

        </v-card-text>
      </v-card>
      </v-col>

      <v-col>
      <v-card class="ma-4">
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
          <v-select
            v-model="aggregationProperty"
            :items="aggregationPropertyCandidates"
            label="Aggregate by"
          />
          <v-select
            v-if="aggregation === 'groupBy'"
            v-model="meanProperty"
            :items="meanPropertyCandidates"
            label="Mean by"
          />
        </v-card-text>
      </v-card>
      </v-col>
    </v-row>
    <div>Results taken into account: {{ filteredResults.length }}</div>
    <div style="white-space: pre;">{{ JSON.stringify(countBy, null, 2) }}</div>
    <div style="white-space: pre;">{{ JSON.stringify(groupBy, null, 2) }}</div>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import _countBy from 'lodash/fp/countBy'
  import _groupBy from 'lodash/fp/groupBy'
  import _orderBy from 'lodash/fp/orderBy'
  import _meanBy from 'lodash/fp/meanBy'
  import { MatchResult } from '../types'
  import historicResults from '../../data.json'

  type AggregationProperty = 'normalizedResult' | 'oddIsCorrect' | 'total' | 'diff' | 'stage' | 'round' | null
  type MeanProperty = 'probabilitySpan' | 'total' | 'diff' | null
  interface CountResult {
    key: string;
    count: number;
  }
  interface MeanResult {
    key: string;
    mean: number;
  }

  export default Vue.extend({
    name: 'DataVisualizer',
    components: {

    },
    data: () => ({
      historicResults: historicResults as MatchResult[],
      yearFilter: [2016, 2012, 2008, 2004],
      stageFilter: ['group', 'ko'],
      roundFilter: [null, 1, 2, 3],
      excludeDraws: false,
      aggregation: 'countBy',
      aggregationProperty: null as AggregationProperty | null,
      aggregationPropertyCandidates: ['normalizedResult', 'oddIsCorrect', 'total', 'diff', 'stage', 'round'] as AggregationProperty[],
      meanProperty: null as MeanProperty | null,
      meanPropertyCandidates: ['probabilitySpan', 'total', 'diff'] as MeanProperty[]
    }),
    computed: {
      filteredResults(): MatchResult[] {
        return historicResults.filter(result => {
          return this.yearFilter.includes(result.year)
            && this.stageFilter.includes(result.stage)
            && this.roundFilter.includes(result.round)
            && this.excludeDraws ? result.diff > 0 : true
        })
      },
      countBy(): CountResult[] {
        if (this.aggregationProperty) {
          const countByProperty = _countBy(this.aggregationProperty)
          const orderByCount = _orderBy('count', 'desc')
          const result = countByProperty(this.filteredResults)
          const keys = Object.keys(result)
          return orderByCount(keys.map((key) => ({
            key: `${this.aggregationProperty}: ${key}`,
            count: result[key]
          }))) as CountResult[]
        } else {
          return []
        }
      },
      groupBy(): MeanResult[] {
        if (this.aggregationProperty && this.meanProperty) {
          const groupByProperty = _groupBy(this.aggregationProperty)
          const meanByProperty = _meanBy(this.meanProperty)
          const orderByMean = _orderBy('mean', 'desc')
          const groups = groupByProperty(this.filteredResults)
          const keys = Object.keys(groups)
          return orderByMean(keys.map((key) => ({
            key: `${this.aggregationProperty}: ${key}`,
            mean: meanByProperty(groups[key])
          }))) as MeanResult[]
        } else {
          return []
        }
      }
    }
  })
</script>
