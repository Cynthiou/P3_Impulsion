import type {
  WorkoutSession,
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
    const data = await response.json();
    const currentSessionId = data.currentSessionId;

    return { status: "conflict", currentSessionId: currentSessionId };
  }

  if (!response.ok) {
    throw new Error("Impossible de démarrer la séance");
  }

  return { status: "started" };
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
};
