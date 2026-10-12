import { useEffect, useState } from "react";
import workoutSessionService from "../../services/workoutSessionService";
import type {
  CreateExerciseSet,
  ExerciseSet,
} from "../../types/workoutSession";

const useExerciseSets = (sessionExerciseId: number) => {
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      setError(null);

      try {
        const exerciseSets =
          await workoutSessionService.getExerciseSets(sessionExerciseId);
        setSets(exerciseSets);
      } catch {
        setError("Impossible de charger les séries");
      } finally {
        setLoading(false);
      }
    };

    loadSets();
  }, [sessionExerciseId]);

  const addSet = async (values: CreateExerciseSet) => {
    setSaving(true);
    setError(null);

    try {
      const newSet = await workoutSessionService.postExerciseSet(
        sessionExerciseId,
        values,
      );
      setSets((currentSets) => [...currentSets, newSet]);
      return newSet;
    } catch {
      setError("Impossible d'enregistrer la série");
      return null;
    } finally {
      setSaving(false);
    }
  };

  return { sets, loading, saving, error, addSet };
};

export default useExerciseSets;
