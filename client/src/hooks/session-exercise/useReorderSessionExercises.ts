import { useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";

const useReorderSessionExercises = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reorderSessionExercises = async (
    sessionId: number,
    sessionExerciseIds: number[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      await workoutSessionService.reorderWorkoutSessionExercises(
        sessionId,
        sessionExerciseIds,
      );
      return true;
    } catch {
      setError("Impossible d'ordonner les exercices de la séance");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { reorderSessionExercises, loading, error };
};

export default useReorderSessionExercises;
