import type { ExerciseSummary } from "./exercise";

export type WorkoutSessionExercise = ExerciseSummary & {
  sessionExerciseId: number;
  position: number;
  targetSets: number | null;
  targetReps: number | null;
  targetWeightKg: number | string | null;
  targetDurationSeconds: number | null;
  restSeconds: number | null;
};

export type ExerciseSet = {
  id: number;
  setNumber: number;
  repetitions: number | null;
  weightKg: number | string | null;
  durationSeconds: number | null;
  isCompleted: boolean;
};

export type CreateExerciseSet = {
  repetitions: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
};
