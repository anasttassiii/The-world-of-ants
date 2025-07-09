import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { QueenAnt, WorkerAnt, SoldierAnt, Destroyer } from '/antClasses.js'

export const useSimulationStore = defineStore('simulation', () => {
    const colony = ref({
        queens: [],
        workers: [],
        soldiers: [],
        destroyers: [],
        larvae: [],
        food: 3000,
        foodStorage: 150,
        nursery: [],
        isDestroyed: false
    })

    const ANTHILL_AREA = {
        x: 400,
        y: 300,
        radius: 100
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
        maxFoodSources: 50,
        lastDestroyerSpawnTime: 0,
        destroyerSpawnInterval: 30,
        isColonyDestroyed: false
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
        const minDistanceFromAnthill = ANTHILL_AREA.radius + 50;

        for (let i = 0; i < newFoodCount; i++) {
            if (environment.value.foodSources.length < params.value.maxFoodSources) {
                let x, y;
                let attempts = 0;
                const maxAttempts = 100;

                do {
                    x = Math.random() * 800;
                    y = Math.random() * 600;
                    attempts++;

                    const dx = x - ANTHILL_AREA.x;
                    const dy = y - ANTHILL_AREA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > minDistanceFromAnthill || attempts >= maxAttempts) {
                        break;
                    }
                } while (true);

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


    function spawnDestroyer() {
        // Спавн только с 20% вероятностью
        if (Math.random() > 0.2) return;

        // Спавн только в нижней части экрана (y = 600 - это низ)
        const x = Math.random() * 800;  // Случайная позиция по ширине
        const y = 600;                  // Фиксированно внизу экрана

        const destroyer = new Destroyer(x, y);
        destroyer.speed = 0.08;
        colony.value.destroyers.push(destroyer);
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
            destroyers: [],
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
            nursery: [],
            isDestroyed: false
        }
    }

    function updateSimulation(deltaTime) {
        if (!params.value.isRunning || colony.value.isDestroyed) return;

        params.value.lastFoodSpawnTime += deltaTime;
        if (params.value.lastFoodSpawnTime >= params.value.foodSpawnInterval) {
            spawnNewFood();
            params.value.lastFoodSpawnTime = 0;
        }

        // Спавн разрушителей
        params.value.lastDestroyerSpawnTime += deltaTime;
        if (params.value.lastDestroyerSpawnTime >= params.value.destroyerSpawnInterval * 3) {
            if (Math.random() < 0.2) {
                spawnDestroyer();
            }
            params.value.lastDestroyerSpawnTime = 0;
        }

        const tempEffect = getTemperatureEffect(environment.value.temperature);
        const humidityEffect = getHumidityEffect(environment.value.humidity);
        const environmentEffect = tempEffect * humidityEffect;

        // Проверка условий для откладывания личинок
        if ((environment.value.temperature >= 0 && environment.value.temperature <= 7) ||
            environment.value.temperature >= 33 ||
            (environment.value.humidity < 60 || environment.value.humidity > 80)) {
            console.log("Неблагоприятные условия для откладывания личинок");
        }

        colony.value.queens.forEach(queen => {
            if (queen.update(deltaTime, environmentEffect, colony.value, environment.value)) {
                queen.layEggs(deltaTime, colony.value, environment.value);
            }
        });

        colony.value.workers = colony.value.workers.filter(worker =>
            worker.update(deltaTime, environmentEffect, colony.value, environment.value)
        );

        // Обновление солдат и проверка боя с разрушителями
        colony.value.soldiers = colony.value.soldiers.filter(soldier => {
            if (!soldier.update(deltaTime, environmentEffect, colony.value, environment.value)) {
                return false;
            }

            // Проверка ближнего боя с разрушителями
            colony.value.destroyers.forEach(destroyer => {
                const dx = destroyer.x - soldier.x;
                const dy = destroyer.y - soldier.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Бой происходит только при непосредственном контакте (расстояние <= 1)
                if (distance <= 1) {
                    // Солдат атакует
                    if (soldier.attackCooldown <= 0) {
                        destroyer.energy -= 25; // Урон по разрушителю
                        soldier.energy -= 5;   // Затраты энергии на атаку
                        soldier.attackCooldown = 1000; // Кулдаун 1 секунда
                    }

                    // Разрушитель контратакует
                    soldier.energy -= 3 * deltaTime / 1000; // Непрерывный урон при контакте
                }
            });

            return soldier.energy > 0;
        });

        // Обновление разрушителей
        colony.value.destroyers = colony.value.destroyers.filter(destroyer => {
            if (!destroyer.update(deltaTime, colony.value)) {
                return false;
            }

            // Проверка на достижение муравейника
            const dx = ANTHILL_AREA.x - destroyer.x;
            const dy = ANTHILL_AREA.y - destroyer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < ANTHILL_AREA.radius) {
                // Если нет солдат - разрушить муравейник
                if (colony.value.soldiers.length === 0) {
                    colony.value.isDestroyed = true;
                    console.log("Муравейник разрушен!");
                    params.value.isRunning = false;
                }
                return false;
            }

            return true;
        });

        // Удаление побежденных разрушителей
        colony.value.destroyers = colony.value.destroyers.filter(d => d.energy > 0);

        updateLarvae(deltaTime, environmentEffect);
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