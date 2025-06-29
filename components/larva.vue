<script setup>
import { computed } from 'vue'

const props = defineProps({
    larva: {
        type: Object,
        required: true
    }
})

const larvaStyle = computed(() => ({
    left: `${400 + (Math.random() * 50 - 25)}px`,
    top: `${300 + (Math.random() * 50 - 25)}px`,
    opacity: props.larva.energy / 100
}))

const larvaClass = computed(() => `larva-${props.larva.developmentStage}`)
</script>

<template>
    <div class="larva" :class="larvaClass" :style="larvaStyle"></div>
</template>

<style scoped>
.larva {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #fff;
    transform: translate(-50%, -50%);
}

.larva-egg {
    background-color: #f8f8f8;
    width: 4px;
    height: 4px;
}

.larva-larva {
    background-color: #fffacd;
    width: 6px;
    height: 6px;
}

.larva-pupa {
    background-color: #d3d3d3;
    width: 8px;
    height: 8px;
    border-radius: 20%;
}
</style>