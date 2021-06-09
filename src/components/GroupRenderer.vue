<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            {{ groupBy }}
          </th>
          <th class="text-left">
            Mean {{ meanBy }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in value"
          :key="item.key"
        >
          <td>{{ item.key }}</td>
          <td style="width: 100%;">
            <v-progress-linear
              :value="normalizedValue(item.mean)"
              height="24"
            >
              <strong>{{ item.mean.toFixed(2) }}</strong>
            </v-progress-linear>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
  import Vue, { PropType } from 'vue'
  import _maxBy from 'lodash/fp/maxBy'
  import { MeanResult } from '../types'

  export default Vue.extend({
    name: 'GroupRenderer',
    props: {
      value: {
        type: Array as PropType<MeanResult[]>,
        required: true
      },
      groupBy: {
        type: String,
        default: 'Property'
      },
      meanBy: {
        type: String,
        default: ''
      }
    },
    computed: {
      maxValue(): number | undefined {
        return _maxBy('mean', this.value)?.mean
      },
      normalizedValue() {
        return (value: number) => {
          return Math.round(value / (this.maxValue || 1) * 100)
        }
      }
    }
  })
</script>
