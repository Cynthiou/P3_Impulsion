import { useEffect, useState } from "react";
import historyService from "../../services/historyService";
import type { WorkoutSessionDetail } from "../../types/history";

const useWorkoutSessionDetail = (sessionId: number) => {
  const [session, setSession] = useState<WorkoutSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessionDetail = async () => {
      try {
        const sessionData =
          await historyService.getWorkoutSessionDetail(sessionId);
        setSession(sessionData);
      } catch {
        setError("Impossible de charger la séance");
      } finally {
        setLoading(false);
      }
    };

    loadSessionDetail();
  }, [sessionId]);

  return { session, loading, error };
};

export default useWorkoutSessionDetail;
