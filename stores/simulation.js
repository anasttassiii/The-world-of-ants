import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSimulationStore = defineStore('simulation', () => {
    // Состояние колонии
    const colony = ref({
        queens: [],
        workers: [],
        soldiers: [],
        larvae: [],
        food: 2000, // Увеличено количество еды
        foodStorage: 1000,
        nursery: []
    })

    // Параметры окружения
    const environment = ref({
        plants: [],
        foodSources: []
    })

    // Параметры симуляции
    const params = ref({
        speed: 1,
        isRunning: false,
        foodSpawnInterval: 10, // Чаще появляется еда
        lastFoodSpawnTime: 0,
        maxFoodSources: 30 // Больше еды на карте
    })

    // Функция создания новой еды
    function spawnNewFood() {
        const newFoodCount = Math.floor(Math.random() * 5) + 3 // 3-7 новых источников

        for (let i = 0; i < newFoodCount; i++) {
            if (environment.value.foodSources.length < params.value.maxFoodSources) {
                environment.value.foodSources.push({
                    id: `food-${Date.now()}-${i}`,
                    x: Math.random() * 800, // По всему полю
                    y: Math.random() * 600,
                    amount: Math.random() * 200 + 100 // Больше еды
                })
            }
        }
    }

    // Инициализация колонии
    function initializeColony() {
        environment.value.foodSources = []
        // Создаем больше начальной еды
        for (let i = 0; i < 10; i++) {
            spawnNewFood()
        }

        colony.value = {
            queens: [{
                id: 'queen-1',
                type: 'queen',
                age: 0,
                energy: 200,
                x: 400,
                y: 300,
                task: 'laying_eggs'
            }],
            workers: Array.from({ length: 20 }, (_, i) => ({
                id: `worker-${i}`,
                type: 'worker',
                age: Math.random() * 10,
                energy: 100,
                task: i < 10 ? 'foraging' : 'nursing',
                x: 400 + (Math.random() * 100 - 50),
                y: 300 + (Math.random() * 100 - 50),
                carryingFood: false
            })),
            soldiers: Array.from({ length: 5 }, (_, i) => ({
                id: `soldier-${i}`,
                type: 'soldier',
                age: Math.random() * 20,
                energy: 150,
                task: 'patrolling',
                x: 400 + (Math.random() * 100 - 50),
                y: 300 + (Math.random() * 100 - 50)
            })),
            larvae: Array.from({ length: 10 }, (_, i) => ({
                id: `larva-${i}`,
                age: Math.random() * 5,
                foodReceived: 0,
                health: 50,
                x: 350 + (Math.random() * 100),
                y: 250 + (Math.random() * 100)
            })),
            food: 2000,
            foodStorage: 1000,
            nursery: []
        }
    }

    // Обновление симуляции
    function updateSimulation(deltaTime) {
        if (!params.value.isRunning) return

        // Спавним еду
        params.value.lastFoodSpawnTime += deltaTime
        if (params.value.lastFoodSpawnTime >= params.value.foodSpawnInterval) {
            spawnNewFood()
            params.value.lastFoodSpawnTime = 0
        }

        // Удаляем мертвых муравьев
        colony.value.workers = colony.value.workers.filter(worker => {
            const isAlive = updateAnt(worker, deltaTime)
            return isAlive && worker.energy > 0
        })

        colony.value.soldiers = colony.value.soldiers.filter(soldier => {
            const isAlive = updateAnt(soldier, deltaTime)
            return isAlive && soldier.energy > 0
        })

        // Обновляем царицу
        colony.value.queens.forEach(queen => updateAnt(queen, deltaTime))

        // Обновление личинок
        updateLarvae(deltaTime)

        // Царица откладывает яйца
        layEggs(deltaTime)
    }

    // Обновление муравья (возвращает false если умер)
    function updateAnt(ant, deltaTime) {
        ant.age += deltaTime / 1000;
        ant.energy -= 0.005 * deltaTime;

        if (ant.energy <= 0) {
            return false; // Муравей умер
        }

        // Восстановление энергии
        if (colony.value.foodStorage > 10) {
            ant.energy = Math.min(ant.type === 'soldier' ? 150 : 100, ant.energy + 0.002 * deltaTime);
            colony.value.foodStorage -= 0.001 * deltaTime;
        }

        // Логика задач
        if (ant.type === 'worker') {
            if (ant.task === 'foraging') {
                updateForagingWorker(ant, deltaTime);
            } else {
                updateNursingWorker(ant, deltaTime);
            }
        }

        // Случайное движение
        ant.x += (Math.random() - 0.5) * deltaTime * 0.1;
        ant.y += (Math.random() - 0.5) * deltaTime * 0.1;

        // Границы поля
        ant.x = Math.max(0, Math.min(800, ant.x));
        ant.y = Math.max(0, Math.min(600, ant.y));

        return true; // Муравей жив
    }

    function updateForagingWorker(worker, deltaTime) {
        if (worker.carryingFood) {
            // Возвращаемся в муравейник
            const dx = 400 - worker.x;
            const dy = 300 - worker.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 10) {
                colony.value.foodStorage += 10;
                worker.carryingFood = false;
            } else {
                worker.x += (dx / distance) * 0.2 * deltaTime;
                worker.y += (dy / distance) * 0.2 * deltaTime;
            }
        } else {
            // Ищем еду
            let closestFood = null;
            let minDistance = Infinity;

            environment.value.foodSources.forEach(source => {
                if (source.amount > 0) {
                    const dx = source.x - worker.x;
                    const dy = source.y - worker.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFood = source;
                    }
                }
            });

            if (closestFood) {
                if (minDistance < 10) {
                    const collected = Math.min(20, closestFood.amount);
                    closestFood.amount -= collected;
                    worker.carryingFood = true;

                    if (closestFood.amount <= 0) {
                        environment.value.foodSources = environment.value.foodSources.filter(f => f.id !== closestFood.id);
                    }
                } else {
                    const dx = closestFood.x - worker.x;
                    const dy = closestFood.y - worker.y;
                    worker.x += (dx / minDistance) * 0.2 * deltaTime;
                    worker.y += (dy / minDistance) * 0.2 * deltaTime;
                }
            }
        }
    }

    function updateNursingWorker(worker, deltaTime) {
        if (Math.random() < 0.1) {
            worker.x = 350 + Math.random() * 100;
            worker.y = 250 + Math.random() * 100;

            if (colony.value.foodStorage > 5 && colony.value.larvae.length > 0) {
                const larva = colony.value.larvae[Math.floor(Math.random() * colony.value.larvae.length)];
                const foodAmount = 2 + Math.random() * 8;

                if (colony.value.foodStorage >= foodAmount) {
                    larva.foodReceived += foodAmount;
                    larva.health += foodAmount * (0.5 + Math.random());
                    colony.value.foodStorage -= foodAmount;
                }
            }
        }
    }

    function updateLarvae(deltaTime) {
        colony.value.larvae = colony.value.larvae.filter(larva => {
            larva.age += deltaTime / 1000;
            larva.health -= 0.01 * deltaTime;

            if (larva.health <= 0) return false;

            if (larva.age > 8) { // Быстрее растут
                const antType = larva.health > 60 ? 'soldier' : 'worker';
                const newAnt = {
                    id: `ant-${Date.now()}`,
                    type: antType,
                    age: 0,
                    energy: antType === 'soldier' ? 150 : 100,
                    task: antType === 'soldier' ? 'patrolling' : (Math.random() > 0.5 ? 'foraging' : 'nursing'),
                    x: larva.x,
                    y: larva.y
                };

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
        if (colony.value.queens.length === 0) return;

        const queen = colony.value.queens[0];
        queen.age += deltaTime / 1000;

        // Откладывает яйца каждые 5 секунд
        if (queen.age % 5 < deltaTime / 1000 && colony.value.foodStorage > 20) {
            const newLarvaeCount = Math.floor(Math.random() * 3) + 1; // 1-3 личинки

            for (let i = 0; i < newLarvaeCount; i++) {
                colony.value.larvae.push({
                    id: `larva-${Date.now()}-${i}`,
                    age: 0,
                    foodReceived: 0,
                    health: 50,
                    x: 350 + Math.random() * 100,
                    y: 250 + Math.random() * 100
                });
            }

            colony.value.foodStorage -= 10 * newLarvaeCount;
        }
    }

    return {
        colony,
        environment,
        params,
        initializeColony,
        updateSimulation
    }
})