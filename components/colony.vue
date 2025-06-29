<script setup>
import { useSimulationStore } from '/stores/simulation.js'
import Ant from '/components/ant.vue'
import Larva from '/components/larva.vue'

const store = useSimulationStore()
</script>

<template>
    <div class="colony">
        <!-- Отображаем только живых муравьев -->
        <Ant v-for="queen in store.colony.queens.filter(q => q.energy > 0)" 
             :key="queen.id" :ant="queen" type="queen" />
             
        <Ant v-for="worker in store.colony.workers.filter(w => w.energy > 0)" 
             :key="worker.id" :ant="worker" type="worker" />
             
        <Ant v-for="soldier in store.colony.soldiers.filter(s => s.energy > 0)" 
             :key="soldier.id" :ant="soldier" type="soldier" />
             
        <Larva v-for="larva in store.colony.larvae.filter(l => l.health > 0)" 
               :key="larva.id" :larva="larva" />
    </div>
</template>

<style scoped>
.colony {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>