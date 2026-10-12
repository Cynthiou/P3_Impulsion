import type { WorkoutSessionExercise } from "./sessionExercise";

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
  sets: {
    repetitions: number | null;
    weightKg: number | string | null;
  }[];
};
