import { useEffect, useState } from "react";
import historyService from "../../services/historyService";
import type { WorkoutSessionHistory } from "../../types/history";

const useHistorySessions = () => {
  const [sessions, setSessions] = useState<WorkoutSessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompletedSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionsData = await historyService.getHistory();
        setSessions(sessionsData);
      } catch {
        setError("Impossible de charger l'historique");
      } finally {
        setLoading(false);
      }
    };

    loadCompletedSessions();
  }, []);

  return { sessions, loading, error };
};

export default useHistorySessions;
