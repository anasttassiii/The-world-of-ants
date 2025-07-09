<script setup>
import { useSimulationStore } from '/stores/simulation.js'
import Ant from '/components/ant.vue'
import Larva from '/components/larva.vue'

const store = useSimulationStore()
</script>

<template>
    <div class="colony">
        <template v-if="!store.colony.isDestroyed">
            <Ant v-for="queen in store.colony.queens.filter(q => q.energy > 0)" 
                 :key="queen.id" :ant="queen" type="queen" />
                 
            <Ant v-for="worker in store.colony.workers.filter(w => w.energy > 0)" 
                 :key="worker.id" :ant="worker" type="worker" />
                 
            <Ant v-for="soldier in store.colony.soldiers.filter(s => s.energy > 0)" 
                 :key="soldier.id" :ant="soldier" type="soldier" />
                 
            <Ant v-for="destroyer in store.colony.destroyers.filter(d => d.energy > 0)"
                 :key="destroyer.id" :ant="destroyer" type="destroyer" />
                 
            <Larva v-for="larva in store.colony.larvae.filter(l => l.health > 0)" 
                   :key="larva.id" :larva="larva" />
        </template>
        <div v-else class="destroyed-anthill">
            <div class="rubble"></div>
        </div>
    </div>
</template>

<style scoped>
.colony {
    position: absolute;
    width: 100%;
    height: 100%;
}

.destroyed-anthill {
    position: absolute;
    width: 150px;
    height: 150px;
    left: 400px;
    top: 300px;
    transform: translate(-50%, -50%);
}

.rubble {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #5a4a42;
    border-radius: 50%;
    opacity: 0.8;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
}

.rubble::after {
    content: '';
    position: absolute;
    top: 20%;
    left: 20%;
    width: 60%;
    height: 60%;
    background-color: #3a2a22;
    border-radius: 50%;
}
</style>