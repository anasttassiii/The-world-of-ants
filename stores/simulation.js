import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSimulationStore = defineStore('simulation', () => {
    // Состояние колонии
    const colony = ref({
        queens: [],
        workers: [],
        soldiers: [],
        larvae: [],
        food: 1000,
        water: 1000,
        aphidColonies: 3,
        fungusFarms: 2
    })

    // Параметры окружения
    const environment = ref({
        dayCycle: 'day',
        temperature: 25,
        plants: [],
        dayTime: 0
    })

    // Параметры симуляции
    const params = ref({
        speed: 1,
        isRunning: false,
        dayDuration: 60000 // 1 минута реального времени = 1 день
    })

    // Генерация растений
    function generatePlants(count) {
        return Array.from({ length: count }, (_, i) => ({
            id: `plant-${i}`,
            x: Math.random() * 750 + 25,
            y: Math.random() * 550 + 25,
            size: Math.random() * 30 + 20,
            health: Math.random() * 50 + 50
        }))
    }

    // Инициализация колонии
    function initializeColony() {
        environment.value.plants = generatePlants(20)

        colony.value = {
            queens: [{
                id: 'queen-1',
                type: 'queen',
                age: 0,
                energy: 200,
                x: 400,
                y: 300
            }],
            workers: Array.from({ length: 20 }, (_, i) => ({
                id: `worker-${i}`,
                type: 'worker',
                age: Math.random() * 10,
                energy: 100,
                task: null,
                x: 400 + (Math.random() * 100 - 50),
                y: 300 + (Math.random() * 100 - 50)
            })),
            soldiers: Array.from({ length: 5 }, (_, i) => ({
                id: `soldier-${i}`,
                type: 'soldier',
                age: Math.random() * 20,
                energy: 150,
                task: null,
                x: 400 + (Math.random() * 100 - 50),
                y: 300 + (Math.random() * 100 - 50)
            })),
            larvae: Array.from({ length: 10 }, (_, i) => ({
                id: `larva-${i}`,
                age: Math.random() * 5,
                foodReceived: 0,
                developmentStage: ['egg', 'larva', 'pupa'][Math.floor(Math.random() * 3)],
                x: 400 + (Math.random() * 50 - 25),
                y: 300 + (Math.random() * 50 - 25)
            })),
            food: 1000,
            water: 1000,
            aphidColonies: 3,
            fungusFarms: 2
        }
    }

    // Обновление симуляции
    function updateSimulation(deltaTime) {
        if (!params.value.isRunning) return

        // Обновление времени дня
        environment.value.dayTime += deltaTime
        if (environment.value.dayTime > params.value.dayDuration) {
            environment.value.dayCycle = environment.value.dayCycle === 'day' ? 'night' : 'day'
            environment.value.dayTime = 0
            newDayActions()
        }

        // Обновление муравьев
        colony.value.workers.forEach(worker => updateAnt(worker, deltaTime))
        colony.value.soldiers.forEach(soldier => updateAnt(soldier, deltaTime))
        colony.value.queens.forEach(queen => updateAnt(queen, deltaTime))

        // Обновление личинок
        updateLarvae(deltaTime)

        // Обновление ресурсов
        updateResources(deltaTime)
    }

    // Действия при наступлении нового дня
    function newDayActions() {
        // Царица откладывает яйца
        if (colony.value.food > 100) {
            const newEggs = Math.floor(Math.random() * 3)
            for (let i = 0; i < newEggs; i++) {
                colony.value.larvae.push({
                    id: `larva-${Date.now()}-${i}`,
                    age: 0,
                    foodReceived: 0,
                    developmentStage: 'egg',
                    x: 400 + (Math.random() * 30 - 15),
                    y: 300 + (Math.random() * 30 - 15)
                })
            }
            colony.value.food -= 50 * newEggs
        }
    }

    // Вспомогательные функции
    function updateAnt(ant, deltaTime) {
        // Обновление возраста и энергии
        ant.age += deltaTime / 1000;

        // Муравьи теряют энергию со временем
        ant.energy -= 0.005 * deltaTime;

        // Если муравей без энергии - пропускаем
        if (ant.energy <= 0) {
            ant.energy = 0;
            return;
        }

        // Автоматическое восстановление энергии при достаточных ресурсах
        if (colony.value.food > 100 && colony.value.water > 50) {
            ant.energy = Math.min(100, ant.energy + 0.002 * deltaTime);
            colony.value.food -= 0.001 * deltaTime;
            colony.value.water -= 0.0005 * deltaTime;
        }

        // Логика движения
        if (!ant.task || Math.random() < 0.01) {
            // Случайное блуждание
            ant.x += (Math.random() - 0.5) * deltaTime * 0.2;
            ant.y += (Math.random() - 0.5) * deltaTime * 0.2;

            // Удерживаем в границах
            ant.x = Math.max(20, Math.min(780, ant.x));
            ant.y = Math.max(20, Math.min(580, ant.y));
        }

        // Периодическая смена задач
        if (Math.random() < 0.0005 * deltaTime) {
            ant.task = ['foraging', 'nursing', 'building', 'patrolling'][Math.floor(Math.random() * 4)];
        }
    }

    function updateLarvae(deltaTime) {
        let availableFood = colony.value.food * 0.1 // 10% от общего запаса пищи доступно для личинок

        colony.value.larvae = colony.value.larvae.filter(larva => {
            larva.age += deltaTime / 1000

            // Личинки получают пищу от рабочих
            if (availableFood > 0 && Math.random() > 0.7) {
                const foodAmount = Math.min(1, availableFood)
                larva.foodReceived += foodAmount
                availableFood -= foodAmount
                colony.value.food -= foodAmount
            }

            // Превращение во взрослого муравья
            if (larva.age > 10 && larva.foodReceived > 50) {
                const antType = larva.foodReceived > 80 ? 'soldier' : 'worker'
                const newAnt = {
                    id: `ant-${Date.now()}`,
                    type: antType,
                    age: 0,
                    energy: antType === 'soldier' ? 150 : 100,
                    task: null,
                    x: larva.x,
                    y: larva.y
                }

                if (antType === 'worker') {
                    colony.value.workers.push(newAnt)
                } else {
                    colony.value.soldiers.push(newAnt)
                }
                return false // Удаляем личинку
            }

            return true // Оставляем личинку
        })
    }

    function updateResources(deltaTime) {
        // Потребление ресурсов
        const consumptionRate = 0.1 * colony.value.workers.length + 0.2 * colony.value.soldiers.length
        colony.value.food -= consumptionRate * deltaTime / 1000
        colony.value.water -= consumptionRate * 0.5 * deltaTime / 1000

        // Производство пищи тлями
        colony.value.food += 0.2 * colony.value.aphidColonies * deltaTime / 1000

        // Производство пищи грибными фермами
        colony.value.food += 0.5 * colony.value.fungusFarms * deltaTime / 1000

        // Ограничение ресурсов
        colony.value.food = Math.max(0, colony.value.food)
        colony.value.water = Math.max(0, colony.value.water)
    }

    return {
        colony,
        environment,
        params,
        initializeColony,
        updateSimulation
    }
})