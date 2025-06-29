<script setup>
const emit = defineEmits(['start', 'stop', 'reset'])

const start = () => emit('start')
const stop = () => emit('stop')
const reset = () => emit('reset')
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
    gap: 10px;
    padding: 10px;
}

.controls button {
    padding: 5px 10px;
    cursor: pointer;
}
</style>