<script setup>
import { computed } from 'vue'

const props = defineProps({
    larva: {
        type: Object,
        required: true
    }
})

const larvaStyle = computed(() => ({
    left: `${props.larva.x}px`,
    top: `${props.larva.y}px`,
    width: `${8 + props.larva.age}px`,
    height: `${8 + props.larva.age}px`,
    opacity: props.larva.health / 100
}))
</script>

<template>
    <div class="larva" :style="larvaStyle"></div>
</template>

<style scoped>
.larva {
    position: absolute;
    background-color: #fffacd;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease;
}
</style>