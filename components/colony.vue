<script setup>
import { useSimulationStore } from '/stores/simulation.js'
import Ant from '/components/ant.vue'
import Larva from '/components/larva.vue'

const store = useSimulationStore()
</script>

<template>
    <div class="colony">
        <!-- Царицы -->
        <Ant v-for="queen in store.colony.queens" :key="queen.id" :ant="queen" type="queen" />

        <!-- Рабочие -->
        <Ant v-for="worker in store.colony.workers" :key="worker.id" :ant="worker" type="worker" />

        <!-- Солдаты -->
        <Ant v-for="soldier in store.colony.soldiers" :key="soldier.id" :ant="soldier" type="soldier" />

        <!-- Личинки -->
        <Larva v-for="larva in store.colony.larvae" :key="larva.id" :larva="larva" />
    </div>
</template>

<style scoped>
.colony {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>