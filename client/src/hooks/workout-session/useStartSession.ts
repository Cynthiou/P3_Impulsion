import { useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";

const useStartSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const startSession = async (sessionId: number) => {
    setLoading(true);
    setError(null);
    setCurrentSessionId(null);

    try {
      const startResult =
        await workoutSessionService.startWorkoutSession(sessionId);
      const isConflict = startResult.status === "conflict";

      if (isConflict) {
        setCurrentSessionId(startResult.currentSessionId);
        return false;
      }

      return true;
    } catch {
      setError("Impossible de démarrer la séance");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { startSession, loading, error, currentSessionId };
};

export default useStartSession;
