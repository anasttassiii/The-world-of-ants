<script setup>
import { useSimulationStore } from '/stores/simulation'

const store = useSimulationStore()

const anthillStyle = {
    left: '400px',
    top: '300px',
    width: '150px',
    height: '150px'
}

const nurseryStyle = {
    left: '350px',
    top: '250px',
    width: '100px',
    height: '100px'
}

const foodStorageStyle = {
    left: '450px',
    top: '300px',
    width: '50px',
    height: '50px'
}
</script>

<template>
    <div class="environment day">
        <!-- Муравейник -->
        <div class="anthill" :style="anthillStyle">
            <!-- Зона выращивания личинок -->
            <div class="nursery-area" :style="nurseryStyle"></div>
            <!-- Хранилище еды -->
            <div class="food-storage" :style="foodStorageStyle"></div>
        </div>
        
         <!-- Источники пищи -->
         <div v-for="food in store.environment.foodSources" 
             :key="food.id" 
             class="food-source" 
             :style="{
                left: `${food.x}px`,
                top: `${food.y}px`,
                width: `${Math.sqrt(food.amount)}px`,
                height: `${Math.sqrt(food.amount)}px`
             }"></div>
    </div>
</template>

<style scoped>
.environment {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #f8f8d3;
}

.anthill {
    position: absolute;
    background-color: #8B4513;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.7;
}

.nursery-area {
    position: absolute;
    background-color: #FFD700;
    border-radius: 50%;
    opacity: 0.3;
}

.food-storage {
    position: absolute;
    background-color: #32CD32;
    border-radius: 50%;
    opacity: 0.3;
}

.food-source {
    position: absolute;
    background-color: #32CD32;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}
</style>