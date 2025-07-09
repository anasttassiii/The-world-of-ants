<script setup>
import { computed } from 'vue'

const props = defineProps({
    ant: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

const antStyle = computed(() => ({
    left: `${props.ant.x}px`,
    top: `${props.ant.y}px`,
    backgroundColor: props.type === 'queen' ? 'purple' :
        props.type === 'soldier' ? 'red' : 
        props.type === 'worker' && props.ant.task === 'foraging' ? 'black' : 
        props.type === 'destroyer' ? 'darkred' : 'green',
    opacity: props.ant.energy > 10 ? 1 : props.ant.energy / 10
}))

const antClass = computed(() => ({
    'ant-carrying': props.ant.carryingFood,
    'ant-dying': props.ant.energy <= 10
}))
</script>

<template>
    <div class="ant" :style="antStyle" :class="[{
        'ant-queen': type === 'queen',
        'ant-worker': type === 'worker',
        'ant-soldier': type === 'soldier',
        'ant-destroyer': type === 'destroyer'
    }, antClass]">
        <span v-if="ant.energy <= 10" class="death-icon">💀</span>
        <span v-if="type === 'queen'" class="crown-icon">👑</span>
        <span v-if="type === 'destroyer'" class="skull-icon">☠️</span>
    </div>
</template>

<style scoped>
.ant {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.5s ease;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ant-queen {
    width: 12px;
    height: 12px;
    z-index: 10;
}

.ant-soldier {
    width: 10px;
    height: 10px;
}

.ant-destroyer {
    width: 12px;
    height: 12px;
    z-index: 10;
}

.ant-carrying::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 5px;
    height: 5px;
    background-color: yellow;
    border-radius: 50%;
}

.ant-dying {
    transform: translate(-50%, -50%) scale(0.8);
}

.death-icon {
    font-size: 8px;
    position: absolute;
    top: -8px;
}

.crown-icon {
    font-size: 10px;
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 11;
    filter: drop-shadow(0 0 2px gold);
}

.skull-icon {
    font-size: 10px;
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 11;
}
</style>