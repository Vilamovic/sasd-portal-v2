import { useState, useEffect } from 'react';

/**
 * usePenaltyTimers - Hook dla countdown timerów aktywnych kar
 */
export function usePenaltyTimers(activePenalties: any[]) {
  const [penaltyTimers, setPenaltyTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!activePenalties || activePenalties.length === 0) {
      setPenaltyTimers({});
      return;
    }

    const updateTimers = () => {
      const newTimers: Record<string, number> = {};
      activePenalties.forEach((penalty) => {
        if (penalty.remaining_seconds && penalty.remaining_seconds > 0) {
          newTimers[penalty.id] = penalty.remaining_seconds;
        }
      });
      setPenaltyTimers(newTimers);
    };

    updateTimers();

    const interval = setInterval(() => {
      setPenaltyTimers((prev) => {
        const updated: Record<string, number> = {};
        Object.keys(prev).forEach((id) => {
          const remaining = prev[id] - 1;
          if (remaining > 0) {
            updated[id] = remaining;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePenalties]);

  return penaltyTimers;
}
