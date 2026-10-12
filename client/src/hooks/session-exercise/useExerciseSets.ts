import { useEffect, useState } from "react";
import sessionExerciseService from "../../services/sessionExerciseService";
import type {
  CreateExerciseSet,
  ExerciseSet,
  UpdateExerciseSet,
} from "../../types/sessionExercise";

const useExerciseSets = (sessionExerciseId: number) => {
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingSetId, setUpdatingSetId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      setError(null);

      try {
        const exerciseSets =
          await sessionExerciseService.getExerciseSets(sessionExerciseId);
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
      const newSet = await sessionExerciseService.postExerciseSet(
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

  const updateSet = async (
    exerciseSetId: number,
    values: UpdateExerciseSet,
  ) => {
    setUpdatingSetId(exerciseSetId);
    setError(null);

    try {
      const updatedSet = await sessionExerciseService.patchExerciseSet(
        exerciseSetId,
        values,
      );
      setSets((currentSets) =>
        currentSets.map((set) => (set.id === exerciseSetId ? updatedSet : set)),
      );
      return updatedSet;
    } catch {
      setError("Impossible de mettre à jour la série");
      return null;
    } finally {
      setUpdatingSetId(null);
    }
  };

  return {
    sets,
    loading,
    saving,
    updatingSetId,
    error,
    addSet,
    updateSet,
  };
};

export default useExerciseSets;
