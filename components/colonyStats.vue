<script setup>
import { useSimulationStore } from '/stores/simulation'
import { computed } from 'vue'

const store = useSimulationStore()

const stats = computed(() => ({
    totalAnts: store.colony.queens.length + store.colony.workers.length + store.colony.soldiers.length,
    foodStorage: Math.floor(store.colony.foodStorage),
    larvae: store.colony.larvae.length,
    foragers: store.colony.workers.filter(w => w.task === 'foraging').length,
    nurses: store.colony.workers.filter(w => w.task === 'nursing').length
}))
</script>

<template>
    <div class="stats">
        <h3>Статистика колонии</h3>
        <div class="stat-item">Всего муравьев: {{ stats.totalAnts }}</div>
        <div class="stat-item">Рабочие: {{ store.colony.workers.length }}</div>
        <div class="stat-item">Солдаты: {{ store.colony.soldiers.length }}</div>
        <div class="stat-item">Личинки: {{ stats.larvae }}</div>
        <div class="stat-item">Добытчики: {{ stats.foragers }}</div>
        <div class="stat-item">Няньки: {{ stats.nurses }}</div>
        <div class="stat-item">Еда в хранилище: {{ stats.foodStorage }}</div>
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