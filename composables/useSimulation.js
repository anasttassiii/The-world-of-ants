import { onMounted, onUnmounted } from 'vue'
import { useSimulationStore } from '/stores/simulation.js'

export function useSimulation() {
    const store = useSimulationStore()
    let lastTime = 0
    let animationFrameId = null

    const update = (timestamp) => {
        if (!lastTime) lastTime = timestamp
        const deltaTime = timestamp - lastTime
        lastTime = timestamp

        store.updateSimulation(deltaTime * store.params.speed)

        if (store.params.isRunning) {
            animationFrameId = requestAnimationFrame(update)
        }
    }

    const start = () => {
        store.params.isRunning = true
        lastTime = 0
        animationFrameId = requestAnimationFrame(update)
    }

    const stop = () => {
        store.params.isRunning = false
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
        }
    }

    const reset = () => {
        stop()
        store.initializeColony()
    }

    onMounted(() => {
        store.initializeColony()
    })

    onUnmounted(() => {
        stop()
    })

    return {
        start,
        stop,
        reset
    }
}