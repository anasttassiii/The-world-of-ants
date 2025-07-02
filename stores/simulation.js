import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSimulationStore = defineStore('simulation', () => {
    // Состояние колонии
    const colony = ref({
        queens: [],
        workers: [],
        soldiers: [],
        larvae: [],
        food: 3000,
        foodStorage: 150,
        nursery: []
    })

    // Параметры окружения
    const environment = ref({
        plants: [],
        foodSources: [],
        temperature: 20,
        humidity: 75
    })

    // Параметры симуляции
    const params = ref({
        speed: 1,
        isRunning: false,
        foodSpawnInterval: 5,
        lastFoodSpawnTime: 0,
        maxFoodSources: 50
    })

    // Функция для расчета модификатора температуры
    const getTemperatureEffect = (temp) => {
        if (temp <= 7) return -0.2;  // Погибают
        if (temp <= 18) return 0.5;  // Медленные
        if (temp <= 32) return 1.0;  // Активные
        return -0.2;                 // Погибают
    }

    // Функция для расчета модификатора влажности
    const getHumidityEffect = (humidity) => {
        if (humidity >= 60 && humidity <= 80) return 1.0;  // Нормально
        return -0.1;  // Постепенно умирают
    }

    // Функция создания новой еды
    function spawnNewFood() {
        const newFoodCount = Math.floor(Math.random() * 8) + 5

        for (let i = 0; i < newFoodCount; i++) {
            if (environment.value.foodSources.length < params.value.maxFoodSources) {
                environment.value.foodSources.push({
                    id: `food-${Date.now()}-${i}`,
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    amount: Math.random() * 300 + 200
                })
            }
        }
    }

    function setTemperature(value) {
        environment.value.temperature = Number(value)
    }

    function setHumidity(value) {
        environment.value.humidity = Number(value)
    }

    // Инициализация колонии
    function initializeColony() {
        environment.value.foodSources = []
        for (let i = 0; i < 15; i++) {
            spawnNewFood()
        }

        colony.value = {
            queens: [{
                id: 'queen-1',
                type: 'queen',
                age: 0,
                energy: 300,
                x: 400,
                y: 300,
                task: 'laying_eggs',
                lastFed: 0
            }],
            workers: Array.from({ length: 30 }, (_, i) => ({
                id: `worker-${i}`,
                type: 'worker',
                age: Math.random() * 10,
                energy: 120,
                task: i < 30 ? 'foraging' : 'nursing',
                x: 400 + (Math.random() * 100 - 50),
                y: 300 + (Math.random() * 100 - 50),
                carryingFood: false
            })),
            soldiers: Array.from({ length: 5 }, (_, i) => ({
                id: `soldier-${i}`,
                type: 'soldier',
                age: Math.random() * 20,
                energy: 180,
                task: 'patrolling',
                x: 400 + (Math.random() * 100 - 50),
                y: 300 + (Math.random() * 100 - 50)
            })),
            larvae: Array.from({ length: 15 }, (_, i) => ({
                id: `larva-${i}`,
                age: Math.random() * 5,
                foodReceived: 0,
                health: 70,
                x: 350 + (Math.random() * 100),
                y: 250 + (Math.random() * 100)
            })),
            food: 3000,
            foodStorage: 150,
            nursery: []
        }
    }

    // Обновление симуляции
    function updateSimulation(deltaTime) {
        if (!params.value.isRunning) return

        // Спавн еды
        params.value.lastFoodSpawnTime += deltaTime
        if (params.value.lastFoodSpawnTime >= params.value.foodSpawnInterval) {
            spawnNewFood()
            params.value.lastFoodSpawnTime = 0
        }

        // Влияние температуры и влажности
        const tempEffect = getTemperatureEffect(environment.value.temperature)
        const humidityEffect = getHumidityEffect(environment.value.humidity)
        const environmentEffect = tempEffect * humidityEffect

        // Кормление царицы
        feedQueen(deltaTime, environmentEffect)

        // Обновление муравьев
        colony.value.workers = colony.value.workers.filter(worker => {
            const isAlive = updateAnt(worker, deltaTime, environmentEffect)
            return isAlive && worker.energy > 0
        })

        colony.value.soldiers = colony.value.soldiers.filter(soldier => {
            const isAlive = updateAnt(soldier, deltaTime, environmentEffect)
            return isAlive && soldier.energy > 0
        })

        // Обновляем царицу
        colony.value.queens.forEach(queen => updateAnt(queen, deltaTime, environmentEffect))

        // Обновление личинок
        updateLarvae(deltaTime, environmentEffect)

        // Царица откладывает яйца
        layEggs(deltaTime)
    }

    // Кормление царицы с учетом эффектов среды
    function feedQueen(deltaTime, environmentEffect) {
        if (colony.value.queens.length === 0) return

        const queen = colony.value.queens[0]
        queen.lastFed += deltaTime / 1000

        if (queen.lastFed >= 2 && colony.value.foodStorage > 30) {
            const foodAmount = 20 + Math.random() * 30
            if (colony.value.foodStorage >= foodAmount) {
                queen.energy = Math.min(300, queen.energy + foodAmount * 0.5 * Math.max(0, environmentEffect))
                colony.value.foodStorage -= foodAmount
                queen.lastFed = 0
            }
        }
    }

    // Обновление муравья с учетом эффектов среды
    function updateAnt(ant, deltaTime, environmentEffect) {
        ant.age += deltaTime / 1000

        // Потеря энергии зависит от условий среды
        const energyLoss = 0.001 * deltaTime * (environmentEffect > 0 ? 1 / environmentEffect : 2)
        ant.energy -= energyLoss

        if (ant.energy <= 0) return false

        // Восстановление энергии
        if (colony.value.foodStorage > 20) {
            ant.energy = Math.min(
                ant.type === 'queen' ? 300 :
                    ant.type === 'soldier' ? 180 : 120,
                ant.energy + 0.003 * deltaTime * Math.max(0, environmentEffect)
            )
            colony.value.foodStorage -= 0.02 * deltaTime
        }

        // Логика задач
        if (ant.type === 'worker') {
            if (ant.task === 'foraging') {
                updateForagingWorker(ant, deltaTime, environmentEffect)
            } else {
                updateNursingWorker(ant, deltaTime, environmentEffect)
            }
        }

        // Движение зависит от условий среды
        const moveSpeed = 0.15 * Math.max(0, environmentEffect)
        ant.x += (Math.random() - 0.5) * deltaTime * moveSpeed
        ant.y += (Math.random() - 0.5) * deltaTime * moveSpeed

        // Границы
        ant.x = Math.max(0, Math.min(800, ant.x))
        ant.y = Math.max(0, Math.min(600, ant.y))

        return true
    }

    function updateForagingWorker(worker, deltaTime) {
        if (worker.carryingFood) {
            // Возвращаемся в муравейник
            const dx = 400 - worker.x
            const dy = 300 - worker.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 15) {
                colony.value.foodStorage += 20 // Больше приносим еды
                worker.carryingFood = false
            } else {
                worker.x += (dx / distance) * 0.5
                worker.y += (dy / distance) * 0.5
            }
        } else {
            // Ищем ближайшую еду
            let closestFood = null
            let minDistance = Infinity

            environment.value.foodSources.forEach(source => {
                if (source.amount > 0) {
                    const dx = source.x - worker.x
                    const dy = source.y - worker.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < minDistance) {
                        minDistance = distance
                        closestFood = source
                    }
                }
            })

            if (closestFood) {
                if (minDistance < 1) {
                    const collected = Math.min(30, closestFood.amount) // Больше собираем
                    closestFood.amount -= collected
                    worker.carryingFood = true

                    if (closestFood.amount <= 0) {
                        environment.value.foodSources = environment.value.foodSources.filter(f => f.id !== closestFood.id)
                    }
                } else {
                    const dx = closestFood.x - worker.x
                    const dy = closestFood.y - worker.y
                    worker.x += (dx / minDistance) * 0.25
                    worker.y += (dy / minDistance) * 0.25

                }
            }
        }
    }
    function updateNursingWorker(worker, deltaTime, environmentEffect) {
        if (Math.random() < 0.15 * Math.max(0, environmentEffect)) {
            worker.x = 350 + Math.random() * 100
            worker.y = 250 + Math.random() * 100

            if (colony.value.foodStorage > 10 && colony.value.larvae.length > 0) {
                const larva = colony.value.larvae[Math.floor(Math.random() * colony.value.larvae.length)]
                const foodAmount = 3 + Math.random() * 12

                if (colony.value.foodStorage >= foodAmount) {
                    larva.foodReceived += foodAmount
                    larva.health += foodAmount * (0.8 + Math.random() * 0.8) * Math.max(0, environmentEffect)
                    colony.value.foodStorage -= foodAmount
                }
            }
        }
    }

    function updateLarvae(deltaTime, environmentEffect) {
        colony.value.larvae = colony.value.larvae.filter(larva => {
            larva.age += deltaTime / 1000
            larva.health -= 0.005 * deltaTime * (environmentEffect > 0 ? 1 / environmentEffect : 2)

            if (larva.health <= 0) return false

            if (larva.age > 6) {
                // Определяем тип муравья случайным образом с учетом здоровья личинки
                const randomValue = Math.random() * 100;
                let antType;

                // Чем здоровее личинка, тем больше шанс стать солдатом
                if (randomValue < 30 + larva.health / 2) { // 30% базовый шанс + зависит от здоровья
                    antType = 'soldier';
                } else {
                    antType = 'worker';
                }

                const newAnt = {
                    id: `ant-${Date.now()}`,
                    type: antType,
                    age: 0,
                    energy: antType === 'soldier' ? 180 : 120,
                    task: antType === 'soldier' ? 'patrolling' :
                        (Math.random() > 0.5 ? 'foraging' : 'nursing'),
                    x: larva.x,
                    y: larva.y,
                    carryingFood: false
                }

                if (antType === 'worker') {
                    colony.value.workers.push(newAnt);
                } else {
                    colony.value.soldiers.push(newAnt);
                }
                return false;
            }

            return true;
        });
    }

    function layEggs(deltaTime) {
        if (colony.value.queens.length === 0 || environment.value.temperature <= 7 || environment.value.temperature >= 33) return

        const queen = colony.value.queens[0]
        queen.age += deltaTime / 1000

        if (queen.age % 3 < deltaTime / 1000 && colony.value.foodStorage > 30) {
            const newLarvaeCount = Math.floor(Math.random() * 4) + 2

            for (let i = 0; i < newLarvaeCount; i++) {
                colony.value.larvae.push({
                    id: `larva-${Date.now()}-${i}`,
                    age: 0,
                    foodReceived: 0,
                    health: 70,
                    x: 350 + Math.random() * 100,
                    y: 250 + Math.random() * 100
                })
            }

            colony.value.foodStorage -= 15 * newLarvaeCount
        }
    }

    return {
        colony,
        environment,
        params,
        initializeColony,
        updateSimulation,
        setTemperature,
        setHumidity
    }
})