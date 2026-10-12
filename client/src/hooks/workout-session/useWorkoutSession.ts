import { useEffect, useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";
import type { WorkoutSessionExercise } from "../../types/sessionExercise";
import type { WorkoutSession } from "../../types/workoutSession";

const useWorkoutSession = (sessionId: number) => {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      setSession(null);
      setLoading(false);
      setError(null);
      return;
    }

    const loadSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const sessionData =
          await workoutSessionService.getWorkoutSessionById(sessionId);
        setSession(sessionData);
      } catch {
        setError("Impossible de charger la séance");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [sessionId]);

  const updateSessionExercises = (exercises: WorkoutSessionExercise[]) => {
    setSession((currentSession) => {
      if (currentSession === null) {
        return null;
      }

      return {
        ...currentSession,
        exercises,
        exerciseCount: exercises.length,
      };
    });
  };

  return { session, loading, error, updateSessionExercises };
};

export default useWorkoutSession;
