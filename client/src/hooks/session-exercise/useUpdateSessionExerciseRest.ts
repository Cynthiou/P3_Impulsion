import { useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";

function useUpdateSessionExerciseRest() {
  const [updatingExerciseId, setUpdatingExerciseId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const updateSessionExerciseRest = async (
    sessionId: number,
    sessionExerciseId: number,
    restSeconds: number | null,
  ) => {
    setUpdatingExerciseId(sessionExerciseId);
    setError(null);

    try {
      await workoutSessionService.updateWorkoutSessionExerciseRest(
        sessionId,
        sessionExerciseId,
        restSeconds,
      );
      return true;
    } catch {
      setError("Impossible de modifier le temps de repos");
      return false;
    } finally {
      setUpdatingExerciseId(null);
    }
  };

  return { updateSessionExerciseRest, updatingExerciseId, error };
}

export default useUpdateSessionExerciseRest;
