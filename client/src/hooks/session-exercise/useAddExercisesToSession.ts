import { useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";

const useAddExercisesToSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addExercisesToSession = async (
    sessionId: number,
    exerciseIds: number[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      await workoutSessionService.postExercisesToSession(
        sessionId,
        exerciseIds,
      );
      return true;
    } catch {
      setError("Impossible d'ajouter les exercices à la séance");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addExercisesToSession, loading, error };
};

export default useAddExercisesToSession;
