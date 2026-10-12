export type WorkoutSessionHistory = {
  id: number;
  date: string;
  durationSeconds: number;
  exerciseCount: number;
};

export type CompletedSet = {
  sessionExerciseId: number;
  setNumber: number;
  repetitions: number | null;
  weightKg: number | string | null;
  durationSeconds: number | null;
};

export type DetailExercise = {
  sessionExerciseId: number;
  id: number;
  name: string;
  position: number;
};

export type DetailExerciseWithSets = {
  sessionExerciseId: number;
  id: number;
  name: string;
  position: number;
  sets: CompletedSet[];
};

export type WorkoutSessionDetail = {
  id: number;
  startedAt: string;
  durationSeconds: number;
  exerciseCount: number;
  exercises: DetailExercise[];
  sets: CompletedSet[];
};
