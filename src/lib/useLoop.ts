import { useEffect, useState } from "react";

/** Counts 0..steps-1 forever, one step per `ms`. */
export function useLoop(steps: number, ms: number, enabled: boolean) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!enabled) return;
        const id = setInterval(() => setTick((t) => (t + 1) % steps), ms);
        return () => clearInterval(id);
    }, [steps, ms, enabled]);
    return tick;
}
