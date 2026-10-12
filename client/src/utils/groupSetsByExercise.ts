import type {
  CompletedSet,
  DetailExercise,
  DetailExerciseWithSets,
} from "../types/workoutSession";

export const groupSetsByExercise = (
  exercises: DetailExercise[],
  sets: CompletedSet[],
) => {
  const groups: DetailExerciseWithSets[] = [];

  for (const exercise of exercises) {
    const exerciseSets = sets.filter(
      (set) => set.sessionExerciseId === exercise.sessionExerciseId,
    );

    groups.push({
      sessionExerciseId: exercise.sessionExerciseId,
      id: exercise.id,
      name: exercise.name,
      position: exercise.position,
      sets: exerciseSets,
    });
  }

  return groups;
};
