<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <img src="https://img.uefa.com/imgml/favicon/comp/euro2020.ico" class="mr-4" style="width: 48px; height: 48px" />
      <h1>EURO 2024</h1>
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
