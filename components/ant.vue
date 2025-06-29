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
        props.type === 'soldier' ? 'red' : 'black'
}))
</script>

<template>
    <div class="ant" :style="antStyle" :class="{
        'ant-queen': type === 'queen',
        'ant-worker': type === 'worker',
        'ant-soldier': type === 'soldier'
    }"></div>
</template>

<style scoped>
.ant {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: left 0.5s linear, top 0.5s linear;
}

.ant-queen {
    width: 12px;
    height: 12px;
}

.ant-soldier {
    width: 10px;
    height: 10px;
}
</style>