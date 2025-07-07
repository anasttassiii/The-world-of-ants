import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { QueenAnt, WorkerAnt, SoldierAnt } from '/antClasses.js'

export const useSimulationStore = defineStore('simulation', () => {
    const colony = ref({
        queens: [],
        workers: [],
        soldiers: [],
        larvae: [],
        food: 3000,
        foodStorage: 150,
        nursery: []
    })


    const ANTHILL_AREA = {
        x: 400,       // Центр муравейника по X
        y: 300,       // Центр муравейника по Y
        radius: 100   // Радиус муравейника
    };

    const environment = ref({
        plants: [],
        foodSources: [],
        temperature: 20,
        humidity: 75
    })

    const params = ref({
        speed: 1,
        isRunning: false,
        foodSpawnInterval: 5,
        lastFoodSpawnTime: 0,
        maxFoodSources: 50
    })

    const getTemperatureEffect = (temp) => {
        if (temp <= 7) return -0.2;
        if (temp <= 18) return 0.5;
        if (temp <= 32) return 1.0;
        return -0.2;
    }

    const getHumidityEffect = (humidity) => {
        if (humidity >= 60 && humidity <= 80) return 1.0;
        return -0.1;
    }

    function spawnNewFood() {
        const newFoodCount = Math.floor(Math.random() * 8) + 5;
        const minDistanceFromAnthill = ANTHILL_AREA.radius + 50; // Минимальное расстояние от муравейника

        for (let i = 0; i < newFoodCount; i++) {
            if (environment.value.foodSources.length < params.value.maxFoodSources) {
                let x, y;
                let attempts = 0;
                const maxAttempts = 100;

                // Пытаемся найти позицию вне муравейника
                do {
                    x = Math.random() * 800;
                    y = Math.random() * 600;
                    attempts++;

                    // Проверяем расстояние до центра муравейника
                    const dx = x - ANTHILL_AREA.x;
                    const dy = y - ANTHILL_AREA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Если еда далеко от муравейника или слишком много попыток - выходим
                    if (distance > minDistanceFromAnthill || attempts >= maxAttempts) {
                        break;
                    }
                } while (true);

                // Добавляем источник пищи только если он вне зоны муравейника
                const dx = x - ANTHILL_AREA.x;
                const dy = y - ANTHILL_AREA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > minDistanceFromAnthill) {
                    environment.value.foodSources.push({
                        id: `food-${Date.now()}-${i}`,
                        x: x,
                        y: y,
                        amount: Math.random() * 300 + 200
                    });
                }
            }
        }
    }

    function setTemperature(value) {
        environment.value.temperature = Number(value)
    }

    function setHumidity(value) {
        environment.value.humidity = Number(value)
    }

    function initializeColony() {
        environment.value.foodSources = []
        for (let i = 0; i < 15; i++) {
            spawnNewFood()
        }

        colony.value = {
            queens: [new QueenAnt(400, 300)],
            workers: Array.from({ length: 30 }, (_, i) =>
                new WorkerAnt(
                    400 + (Math.random() * 100 - 50),
                    300 + (Math.random() * 100 - 50),
                    i < 30 ? 'foraging' : 'nursing'
                )
            ),
            soldiers: Array.from({ length: 5 }, (_, i) =>
                new SoldierAnt(
                    400 + (Math.random() * 100 - 50),
                    300 + (Math.random() * 100 - 50)
                )
            ),
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

    function updateSimulation(deltaTime) {
        if (!params.value.isRunning) return

        params.value.lastFoodSpawnTime += deltaTime
        if (params.value.lastFoodSpawnTime >= params.value.foodSpawnInterval) {
            spawnNewFood()
            params.value.lastFoodSpawnTime = 0
        }

        const tempEffect = getTemperatureEffect(environment.value.temperature)
        const humidityEffect = getHumidityEffect(environment.value.humidity)
        const environmentEffect = tempEffect * humidityEffect

        colony.value.queens.forEach(queen => {
            if (queen.update(deltaTime, environmentEffect, colony.value, environment.value)) {
                queen.layEggs(deltaTime, colony.value, environment.value)
            }
        })

        colony.value.workers = colony.value.workers.filter(worker =>
            worker.update(deltaTime, environmentEffect, colony.value, environment.value)
        )

        colony.value.soldiers = colony.value.soldiers.filter(soldier =>
            soldier.update(deltaTime, environmentEffect, colony.value, environment.value)
        )

        updateLarvae(deltaTime, environmentEffect)
    }

    function updateLarvae(deltaTime, environmentEffect) {
        colony.value.larvae = colony.value.larvae.filter(larva => {
            larva.age += deltaTime / 1000
            larva.health -= 0.005 * deltaTime * (environmentEffect > 0 ? 1 / environmentEffect : 2)

            if (larva.health <= 0) return false

            if (larva.age > 6) {
                const randomValue = Math.random() * 100;
                let ant;

                if (randomValue < larva.health / 2) {
                    ant = new SoldierAnt(larva.x, larva.y);
                    colony.value.soldiers.push(ant);
                } else {
                    ant = new WorkerAnt(larva.x, larva.y);
                    colony.value.workers.push(ant);
                }
                return false;
            }

            return true;
        });
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