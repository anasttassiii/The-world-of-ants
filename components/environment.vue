<script setup>
import { useSimulationStore } from '/stores/simulation'

const store = useSimulationStore()
</script>

<template>
    <div class="environment" :class="store.environment.dayCycle">
        <div v-for="plant in store.environment.plants" :key="plant.id" class="plant" :style="{
            left: `${plant.x}px`,
            top: `${plant.y}px`,
            width: `${plant.size}px`,
            height: `${plant.size}px`,
            opacity: plant.health / 100
        }"></div>
    </div>
</template>

<style scoped>
.environment {
    position: absolute;
    width: 100%;
    height: 100%;
    transition: background-color 2s ease;
}

.environment.day {
    background-color: #f5f5dc;
}

.environment.night {
    background-color: #2c3e50;
}

.plant {
    position: absolute;
    background-color: #2e8b57;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
</style>