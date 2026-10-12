import { useState } from "react";
import sessionExerciseService from "../../services/sessionExerciseService";

function useDeleteSessionExercise() {
  const [deletingExerciseId, setDeletingExerciseId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const deleteSessionExercise = async (
    sessionId: number,
    sessionExerciseId: number,
  ) => {
    setDeletingExerciseId(sessionExerciseId);
    setError(null);

    try {
      await sessionExerciseService.deleteWorkoutSessionExercise(
        sessionId,
        sessionExerciseId,
      );
      return true;
    } catch {
      setError("Impossible de retirer l'exercice de la séance");
      return false;
    } finally {
      setDeletingExerciseId(null);
    }
  };

  return { deleteSessionExercise, deletingExerciseId, error };
}

export default useDeleteSessionExercise;
