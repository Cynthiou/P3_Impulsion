import { useEffect, useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";
import type { WorkoutSession } from "../../types/workoutSession";

const usePreparedSessions = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionsData = await workoutSessionService.getPreparedSessions();
        setSessions(sessionsData);
      } catch {
        setError("Impossible de charger les séances");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  return { sessions, loading, error };
};

export default usePreparedSessions;
