import { useCallback, useEffect, useState } from "react";
import exerciseApi from "../../services/exerciseApi";
import type { ExerciseDetail } from "../../types/exercise";

function useExerciseDetail(exerciseId: number | null) {
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadExerciseDetail = useCallback(async () => {
    if (exerciseId === null) {
      setExerciseDetail(null);
      setIsLoading(false);
      setError(null);
      setNotFound(false);
      return;
    }

    try {
      setIsLoading(true);
      setExerciseDetail(null);
      setError(null);
      setNotFound(false);
      const data = await exerciseApi.fetchExerciseById(exerciseId);
      if (data === null) {
        setExerciseDetail(null);
        setNotFound(true);
        return;
      }

      setExerciseDetail(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    loadExerciseDetail();
  }, [loadExerciseDetail]);

  return {
    exerciseDetail,
    isLoading,
    error,
    notFound,
    retry: loadExerciseDetail,
  };
}

export default useExerciseDetail;
