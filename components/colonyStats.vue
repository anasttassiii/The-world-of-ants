<script setup>
import { useSimulationStore } from '/stores/simulation'
import { ref, computed } from 'vue'

const store = useSimulationStore()

const temperature = ref(20)
const humidity = ref(75)

const stats = computed(() => ({
    totalAnts: store.colony.queens.length + store.colony.workers.length + store.colony.soldiers.length,
    foodStorage: Math.floor(store.colony.foodStorage),
    larvae: store.colony.larvae.length,
    foragers: store.colony.workers.filter(w => w.task === 'foraging').length,
    nurses: store.colony.workers.filter(w => w.task === 'nursing').length
}))

const updateTemperature = (event) => {
  temperature.value = event.target.value
}

const updateHumidity = (event) => {
  humidity.value = event.target.value
}
</script>

<template>
    <div class="stats">
        <h3>Статистика колонии</h3>
        <div class="stat-item">Всего муравьев: {{ stats.totalAnts }}</div>
        <p></p>
        <div class="stat-item">Рабочие: {{ store.colony.workers.length }}</div>
        <div class="stat-item">Солдаты: {{ store.colony.soldiers.length }}</div>
        <div class="stat-item">Личинки: {{ stats.larvae }}</div>
        <div class="stat-item">Добытчики: {{ stats.foragers }}</div>
        <div class="stat-item">Няньки: {{ stats.nurses }}</div>
        <p></p>

        
        <div class="stat-item slider-container">
            Температура: {{ temperature }}°C
            <div class="slider-wrapper">
                <input 
                    type="range" 
                    min="0" 
                    max="35" 
                    v-model="temperature" 
                    @input="updateTemperature"
                    class="slider"
                >
            </div>
        </div>

        <div class="stat-item slider-container">
            Влажность: {{ humidity }}%
            <div class="slider-wrapper">
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="humidity" 
                    @input="updateHumidity"
                    class="slider"
                >
            </div>
        </div>
    </div>
</template>

<style scoped>
.stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    text-align: left;
    padding: 10px;
    background-color: #f8f8f8;
    border-radius: 8px;
}

.stat-item {
    padding: 5px;
    font-size: 14px;
}

.slider-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.slider-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
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

h3 {
    grid-column: 1 / -1;
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #ddd;
}
</style>