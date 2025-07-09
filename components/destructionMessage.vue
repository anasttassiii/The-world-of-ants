<script setup>
import { useSimulationStore } from '/stores/simulation.js';

const store = useSimulationStore();
</script>

<template>
    <div v-if="store.colony.destructionMessage" class="destruction-message">
        {{ store.colony.destructionMessage }}
    </div>
</template>

<style scoped>
.destruction-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 48px;
    font-weight: bold;
    color: red;
    text-shadow: 2px 2px 4px black;
    z-index: 1000;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
    100% { transform: translate(-50%, -50%) scale(1); }
}
</style>