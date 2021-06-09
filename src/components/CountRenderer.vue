<template>
  <v-simple-table>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            {{ countBy }}
          </th>
          <th class="text-left">
            Count
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
              :value="normalizedValue(item.count)"
              height="24"
            >
              <strong>{{ item.count }}</strong>
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

  import { CountResult } from '../types'

  export default Vue.extend({
    name: 'CountRenderer',
    props: {
      value: {
        type: Array as PropType<CountResult[]>,
        required: true
      },
      countBy: {
        type: String,
        default: 'Property'
      }
    },
    computed: {
      maxValue(): number | undefined {
        return _maxBy('count', this.value)?.count
      },
      normalizedValue() {
        return (value: number) => {
          return Math.round(value / (this.maxValue || 1) * 100)
        }
      }
    }
  })
</script>
