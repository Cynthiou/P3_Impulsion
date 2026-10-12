import type {
  WorkoutSessionDetail,
  WorkoutSessionHistory,
} from "../types/workoutSession";

const API_URL = import.meta.env.VITE_API_URL;

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

export default {
  getHistory,
  getWorkoutSessionDetail,
};
