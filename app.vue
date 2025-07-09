<template>
  <div class="app">
    <h1>Модель муравьиной колонии</h1>
    <div class="simulation-container">
      <Environment />
      <Colony />
      <DestructionMessage />
    </div>
    <Controls @start="start" @stop="stop" @reset="reset" />
    <ColonyStats />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSimulation } from '/composables/useSimulation'
import Environment from '/components/environment.vue'
import Colony from '/components/colony.vue'
import Controls from '/components/controls.vue'
import ColonyStats from '/components/colonyStats.vue'
import DestructionMessage from '/components/destructionMessage.vue'

const { start, stop, reset } = useSimulation()

onMounted(() => {
  start() // Автоматический старт симуляции
})
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.simulation-container {
  position: relative;
  width: 800px;
  height: 600px;
  margin: 20px auto;
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5dc;
}
</style>