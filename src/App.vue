<!-- src/App.vue -->
<template>
  <div id="app">
    <GraphCanvas />
  </div>
</template>

<script>
import GraphCanvas from './components/GraphCanvas.vue'

export default {
  name: 'App',
  components: {
    GraphCanvas
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>
