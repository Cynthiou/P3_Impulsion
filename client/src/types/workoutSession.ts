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

export type WorkoutSession = {
  id: number;
  userId: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  status: WorkoutSessionStatus;
  exerciseCount: number;
  completedSetCount?: number;
  exercises?: WorkoutSessionExercise[];
};

export type WorkoutSessionStatus = "prepared" | "in_progress" | "completed";

export type WorkoutSessionSummary = {
  id: number;
  status: WorkoutSessionStatus;
  date: string;
  durationSeconds: number;
  completedSetCount: number;
  exerciseCount: number;
  totalVolumeKg: number;
};

export type WorkoutSessionHistory = {
  id: number;
  date: string;
  durationSeconds: number;
  exerciseCount: number;
  totalVolumeKg: number;
};

export type CompletedSet = {
  sessionExerciseId: number;
  setNumber: number;
  repetitions: number | null;
  weightKg: number | string | null;
  durationSeconds: number | null;
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

export type UpdateExerciseSet = CreateExerciseSet & {
  isCompleted: boolean;
};

export type WorkoutSessionDetailExercise = WorkoutSessionExercise & {
  sets: CompletedSet[];
};

export type WorkoutSessionDetail = {
  id: number;
  userId: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  status: WorkoutSessionStatus;
  exerciseCount: number;
  exercises: WorkoutSessionDetailExercise[];
};
