<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <h1>Euro 2020</h1>
    </v-app-bar>

    <v-main>
      <DataVisualizer />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import DataVisualizer from './components/DataVisualizer.vue';

export default Vue.extend({
  name: 'App',

  components: {
    DataVisualizer,
  }
});
</script>
