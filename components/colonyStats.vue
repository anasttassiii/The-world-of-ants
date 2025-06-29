<script setup>
import { useSimulationStore } from '/stores/simulation'
import { computed } from 'vue'

const store = useSimulationStore()

const stats = computed(() => ({
    totalAnts: store.colony.queens.length + store.colony.workers.length + store.colony.soldiers.length,
    food: Math.floor(store.colony.food),
    water: Math.floor(store.colony.water),
    larvae: store.colony.larvae.length,
    dayCycle: store.environment.dayCycle,
    temperature: store.environment.temperature.toFixed(1)
}))
</script>

<template>
    <div class="stats">
        <h3>Статистика колонии</h3>
        <div class="stat-item">Всего муравьев: {{ stats.totalAnts }}</div>
        <div class="stat-item">Рабочие: {{ store.colony.workers.length }}</div>
        <div class="stat-item">Солдаты: {{ store.colony.soldiers.length }}</div>
        <div class="stat-item">Личинки: {{ stats.larvae }}</div>
        <div class="stat-item">Пища: {{ stats.food }}</div>
        <div class="stat-item">Вода: {{ stats.water }}</div>
        <div class="stat-item">Цикл: {{ stats.dayCycle === 'day' ? 'День' : 'Ночь' }}</div>
        <div class="stat-item">Температура: {{ stats.temperature }}°C</div>
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

h3 {
    grid-column: 1 / -1;
    margin: 0 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #ddd;
}
</style>