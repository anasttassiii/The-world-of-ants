export class AntBase {
    constructor(type, x, y) {
        this.id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.type = type;
        this.age = 0;
        this.energy = 100;
        this.x = x;
        this.y = y;
        this.task = '';
    }

    update(deltaTime, environmentEffect, colony, environment) {
        this.age += deltaTime / 1000;
        this.energy -= 0.001 * deltaTime * (environmentEffect > 0 ? 1 / environmentEffect : 2);

        if (this.energy <= 0) return false;

        if (colony.foodStorage > 20) {
            this.energy = Math.min(
                this.getMaxEnergy(),
                this.energy + 0.003 * deltaTime * Math.max(0, environmentEffect)
            );
            colony.foodStorage -= 0.02 * deltaTime;
        }

        this.move(deltaTime, environmentEffect);
        return true;
    }

    move(deltaTime, environmentEffect) {
        const moveSpeed = 0.15 * Math.max(0, environmentEffect);
        this.x += (Math.random() - 0.5) * deltaTime * moveSpeed;
        this.y += (Math.random() - 0.5) * deltaTime * moveSpeed;

        this.x = Math.max(0, Math.min(800, this.x));
        this.y = Math.max(0, Math.min(600, this.y));
    }

    getMaxEnergy() {
        return 100;
    }
}

export class QueenAnt extends AntBase {
    constructor(x, y) {
        super('queen', x, y);
        this.energy = 300;
        this.task = 'laying_eggs';
        this.lastFed = 0;
        this.baseX = x;  // Запоминаем начальные координаты
        this.baseY = y;
        this.moveRadius = 10;  // Радиус, в пределах которого может двигаться королева
    }

    move(deltaTime, environmentEffect) {
        // Королева двигается очень мало - только в небольшом радиусе от начальной позиции
        if (Math.random() < 0.01) {  // Только 1% шанс на движение
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.moveRadius;

            this.x = this.baseX + Math.cos(angle) * distance;
            this.y = this.baseY + Math.sin(angle) * distance;

            // Гарантируем, что королева не уйдет далеко
            this.x = Math.max(this.baseX - this.moveRadius, Math.min(this.baseX + this.moveRadius, this.x));
            this.y = Math.max(this.baseY - this.moveRadius, Math.min(this.baseY + this.moveRadius, this.y));
        }
    }



    update(deltaTime, environmentEffect, colony, environment) {
        super.update(deltaTime, environmentEffect, colony, environment);
        this.lastFed += deltaTime / 1000;

        if (this.lastFed >= 2 && colony.foodStorage > 30) {
            const foodAmount = 20 + Math.random() * 30;
            if (colony.foodStorage >= foodAmount) {
                this.energy = Math.min(300, this.energy + foodAmount * 0.5 * Math.max(0, environmentEffect));
                colony.foodStorage -= foodAmount;
                this.lastFed = 0;
            }
        }

        return this.energy > 0;
    }

    getMaxEnergy() {
        return 300;
    }

    layEggs(deltaTime, colony, environment) {
        if (environment.temperature <= 7 || environment.temperature >= 33) return;

        this.age += deltaTime / 1000;

        if (this.age % 3 < deltaTime / 1000 && colony.foodStorage > 30) {
            const newLarvaeCount = Math.floor(Math.random() * 4) + 2;

            for (let i = 0; i < newLarvaeCount; i++) {
                colony.larvae.push({
                    id: `larva-${Date.now()}-${i}`,
                    age: 0,
                    foodReceived: 0,
                    health: 70,
                    x: 350 + Math.random() * 100,
                    y: 250 + Math.random() * 100
                });
            }

            colony.foodStorage -= 15 * newLarvaeCount;
        }
    }
}

export class WorkerAnt extends AntBase {
    constructor(x, y, task) {
        super('worker', x, y);
        this.energy = 120;
        this.task = task || (Math.random() > 0.5 ? 'foraging' : 'nursing');
        this.carryingFood = false;
    }

    update(deltaTime, environmentEffect, colony, environment) {
        const isAlive = super.update(deltaTime, environmentEffect, colony, environment);
        if (!isAlive) return false;

        if (this.task === 'foraging') {
            this.updateForaging(deltaTime, colony, environment);
        } else {
            this.updateNursing(deltaTime, environmentEffect, colony);
        }

        return true;
    }

    updateForaging(deltaTime, colony, environment) {
        if (this.carryingFood) {
            const dx = 400 - this.x;
            const dy = 300 - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 15) {
                colony.foodStorage += 20;
                this.carryingFood = false;
            } else {
                this.x += (dx / distance) * 0.5;
                this.y += (dy / distance) * 0.5;
            }
        } else {
            let closestFood = null;
            let minDistance = Infinity;

            environment.foodSources.forEach(source => {
                if (source.amount > 0) {
                    const dx = source.x - this.x;
                    const dy = source.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFood = source;
                    }
                }
            });

            if (closestFood) {
                if (minDistance < 0.5) {
                    const collected = Math.min(30, closestFood.amount);
                    closestFood.amount -= collected;
                    this.carryingFood = true;

                    if (closestFood.amount <= 0) {
                        environment.foodSources = environment.foodSources.filter(f => f.id !== closestFood.id);
                    }
                } else {
                    const dx = closestFood.x - this.x;
                    const dy = closestFood.y - this.y;
                    this.x += (dx / minDistance) * 0.25;
                    this.y += (dy / minDistance) * 0.25;
                }
            }
        }
    }

    updateNursing(deltaTime, environmentEffect, colony) {
        if (Math.random() < 0.15 * Math.max(0, environmentEffect)) {
            this.x = 350 + Math.random() * 100;
            this.y = 250 + Math.random() * 100;

            if (colony.foodStorage > 10 && colony.larvae.length > 0) {
                const larva = colony.larvae[Math.floor(Math.random() * colony.larvae.length)];
                const foodAmount = 3 + Math.random() * 12;

                if (colony.foodStorage >= foodAmount) {
                    larva.foodReceived += foodAmount;
                    larva.health += foodAmount * (0.8 + Math.random() * 0.8) * Math.max(0, environmentEffect);
                    colony.foodStorage -= foodAmount;
                }
            }
        }
    }

    getMaxEnergy() {
        return 120;
    }
}

export class SoldierAnt extends AntBase {
    constructor(x, y) {
        super('soldier', x, y);
        this.energy = 180;
        this.task = 'patrolling';
    }

    getMaxEnergy() {
        return 180;
    }
}