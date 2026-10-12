import type { WorkoutSessionHistory } from "../types/workoutSession";

export type MonthGroup = {
  title: string;
  sessions: WorkoutSessionHistory[];
};

export const groupSessionsByMonth = (sessions: WorkoutSessionHistory[]) => {
  const groups: MonthGroup[] = [];

  for (const session of sessions) {
    const monthName = new Date(session.date).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    const lastMonthGroup = groups[groups.length - 1];

    if (lastMonthGroup !== undefined && lastMonthGroup.title === monthName) {
      lastMonthGroup.sessions.push(session);
    } else {
      groups.push({ title: monthName, sessions: [session] });
    }
  }

  return groups;
};
