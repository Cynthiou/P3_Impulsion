import type {
  CreateExerciseSet,
  ExerciseSet,
  UpdateExerciseSet,
  WorkoutSession,
  WorkoutSessionDetail,
  WorkoutSessionHistory,
  WorkoutSessionSummary,
} from "../types/workoutSession";

const API_URL = import.meta.env.VITE_API_URL;

const getWorkoutSessions = async (): Promise<WorkoutSession[]> => {
  const response = await fetch(`${API_URL}/api/workout-sessions`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossible de charger les séances");
  }
  const sessions = await response.json();
  return sessions;
};

const postWorkoutSession = async (): Promise<number> => {
  const response = await fetch(`${API_URL}/api/workout-sessions`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossible de créer la séance");
  }
  const { id: sessionId } = await response.json();
  return sessionId;
};

const getWorkoutSessionById = async (
  sessionId: number,
): Promise<WorkoutSession> => {
  const response = await fetch(`${API_URL}/api/workout-sessions/${sessionId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossible de charger la séance");
  }
  const session = await response.json();
  return session;
};

const getCurrentSession = async (): Promise<WorkoutSession | null> => {
  const response = await fetch(`${API_URL}/api/workout-sessions/current`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossible de charger la séance en cours");
  }
  const currentSession = await response.json();
  return currentSession;
};

const getSessionSummary = async (
  sessionId: number,
): Promise<WorkoutSessionSummary> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/summary`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error("Impossible de charger le récapitulatif");
  }
  const summary = await response.json();
  return summary;
};

const startWorkoutSession = async (sessionId: number) => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/start`,
    { method: "PATCH", credentials: "include" },
  );
  if (response.status === 409) {
    let currentSessionId = null;

    try {
      const conflict = await response.json();
      currentSessionId = conflict.currentSessionId;
    } catch {
      // la réponse ne contient pas de JSON : on garde null
    }

    return { result: "conflict", currentSessionId: currentSessionId };
  }
  if (!response.ok) {
    throw new Error("Impossible de démarrer la séance");
  }
  return {
    result: "started",
  };
};

const completeWorkoutSession = async (sessionId: number): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/complete`,
    { method: "PATCH", credentials: "include" },
  );
  if (!response.ok) {
    throw new Error("Impossible de valider la séance");
  }
};

const abandonSession = async (sessionId: number): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/abandon`,
    { method: "PATCH", credentials: "include" },
  );
  if (!response.ok) {
    throw new Error("Impossible d'abandonner la séance");
  }
};

const deleteWorkoutSession = async (sessionId: number): Promise<void> => {
  const response = await fetch(`${API_URL}/api/workout-sessions/${sessionId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossible de supprimer la séance");
  }
};

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

const getHistory = async (): Promise<WorkoutSessionHistory[]> => {
  const response = await fetch(`${API_URL}/api/workout-sessions/history`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Impossible de charger les séances");
  }
  const sessions = await response.json();
  return sessions;
};

const getWorkoutSessionDetail = async (
  sessionId: number,
): Promise<WorkoutSessionDetail | null> => {
  const response = await fetch(
    `${API_URL}/api/workout-sessions/${sessionId}/details`,
    { credentials: "include" },
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Impossible de charger cette séance");
  }
  const session = await response.json();
  return session;
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

const patchExerciseSet = async (
  exerciseSetId: number,
  values: UpdateExerciseSet,
): Promise<ExerciseSet> => {
  const response = await fetch(
    `${API_URL}/api/exercise-sets/${exerciseSetId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    },
  );

  if (!response.ok) {
    throw new Error("Impossible de mettre à jour la série");
  }

  return response.json();
};

export default {
  getWorkoutSessions,
  postWorkoutSession,
  getWorkoutSessionById,
  getCurrentSession,
  startWorkoutSession,
  getSessionSummary,
  completeWorkoutSession,
  abandonSession,
  deleteWorkoutSession,
  postExercisesToSession,
  reorderWorkoutSessionExercises,
  updateWorkoutSessionExerciseRest,
  deleteWorkoutSessionExercise,
  getHistory,
  getWorkoutSessionDetail,
  getExerciseSets,
  postExerciseSet,
  patchExerciseSet,
};
