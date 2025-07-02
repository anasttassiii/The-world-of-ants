<script setup>
import { ref } from 'vue'

const emit = defineEmits(['start', 'stop', 'reset', 'set-temperature', 'set-humidity'])

const temperature = ref(20)
const humidity = ref(75)

const start = () => emit('start')
const stop = () => emit('stop')
const reset = () => emit('reset')

const updateTemperature = () => {
  emit('set-temperature', temperature.value)
}

const updateHumidity = () => {
  emit('set-humidity', humidity.value)
}
</script>

<template>
  <div class="controls">
    <button @click="start">Старт</button>
    <button @click="stop">Стоп</button>
    <button @click="reset">Сброс</button>
    
    
  </div>
</template>

<style scoped>
.controls {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    padding: 10px;
    align-items: center;
}

.controls button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 150px;
}

.slider {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    background: #ddd;
    outline: none;

}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4CAF50;
    cursor: pointer;
}
</style>