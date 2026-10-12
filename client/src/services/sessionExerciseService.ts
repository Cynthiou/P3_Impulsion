import type { CreateExerciseSet, ExerciseSet } from "../types/sessionExercise";

const API_URL = import.meta.env.VITE_API_URL;

const postExercisesToSession = async (
  sessionId: number,
  exerciseIds: number[],
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/exercises`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exerciseIds }),
    },
  );
  if (!response.ok) {
    throw new Error("Impossible d'ajouter les exercices");
  }
};

const reorderWorkoutSessionExercises = async (
  sessionId: number,
  sessionExerciseIds: number[],
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/exercises/order`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionExerciseIds }),
    },
  );
  if (!response.ok) {
    throw new Error("Impossible d'ordonner les exercices");
  }
};

const updateWorkoutSessionExerciseRest = async (
  sessionId: number,
  sessionExerciseId: number,
  restSeconds: number | null,
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/rest`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ restSeconds }),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de modifier le temps de repos");
  }
};

const deleteWorkoutSessionExercise = async (
  sessionId: number,
  sessionExerciseId: number,
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/exercises/${sessionExerciseId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de retirer l'exercice de la séance");
  }
};

const postExerciseSet = async (
  sessionExerciseId: number,
  values: CreateExerciseSet,
): Promise<ExerciseSet> => {
  const response = await fetch(
    `${API_URL}/api/session-exercises/${sessionExerciseId}/sets`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible d'enregistrer la série");
  }

  return response.json();
};

const getExerciseSets = async (
  sessionExerciseId: number,
): Promise<ExerciseSet[]> => {
  const response = await fetch(
    `${API_URL}/api/session-exercises/${sessionExerciseId}/sets`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error("Impossible de charger les séries");
  }

  return response.json();
};

export default {
  postExercisesToSession,
  reorderWorkoutSessionExercises,
  updateWorkoutSessionExerciseRest,
  deleteWorkoutSessionExercise,
  postExerciseSet,
  getExerciseSets,
};
