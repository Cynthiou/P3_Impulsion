export type ExerciseSetWithSession = {
  id: number;
  setNumber: number;
  repetitions: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  isCompleted: boolean;
  sessionStatus: string;
};

export type ExerciseSetUpdate = {
  repetitions: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  isCompleted: boolean;
};
