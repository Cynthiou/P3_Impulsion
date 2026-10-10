import { useEffect, useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";
import type { WorkoutSessionHistory } from "../../types/workoutSession";

const useHistorySessions = () => {
  const [sessions, setSessions] = useState<WorkoutSessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionsData = await workoutSessionService.getHistory();
        setSessions(sessionsData);
      } catch {
        setError("Impossible de charger l'historique");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  return { sessions, loading, error };
};

export default useHistorySessions;
