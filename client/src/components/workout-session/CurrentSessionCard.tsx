import { Link } from "react-router";
import ClockIcon from "../../assets/icons/seance/clock.svg?react";
import useChrono from "../../hooks/workout-session/useChrono";
import type { WorkoutSession } from "../../types/workoutSession";
import { formatPlural } from "../../utils/formatPlural";

type CurrentSessionCardProps = {
  session: WorkoutSession;
};

const CurrentSessionCard = ({ session }: CurrentSessionCardProps) => {
  const chrono = useChrono(session.startedAt);
  const exerciseText = formatPlural(session.exerciseCount, "exercice");

  return (
    <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-x-4 rounded-box border-2 border-primary bg-base-200 p-4 shadow-lg shadow-primary/15">
      <p className="col-start-1 flex items-center gap-2 font-semibold text-base-content">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 animate-pulse rounded-full bg-primary"
        />
        Séance en cours
      </p>

      <p className="col-start-1 mt-1 flex items-center gap-1.5 text-info text-sm">
        <ClockIcon aria-hidden="true" className="size-4" />
        {chrono} · {exerciseText}
      </p>

      <Link
        to={`/sessions/${session.id}`}
        className="col-start-2 row-span-2 row-start-1 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-content text-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
      >
        Reprendre
      </Link>
    </div>
  );
};

export default CurrentSessionCard;
