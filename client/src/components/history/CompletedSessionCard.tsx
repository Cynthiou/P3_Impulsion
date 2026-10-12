import { Link } from "react-router";
import ChevronRightIcon from "../../assets/icons/chevrons/chevron-right.svg?react";
import type { WorkoutSessionHistory } from "../../types/workoutSession";
import { formatDuration } from "../../utils/formatDuration";
import { formatPlural } from "../../utils/formatPlural";
import { formatFullDate } from "../../utils/formatSessionDate";

type CompletedSessionCardProps = {
  session: WorkoutSessionHistory;
};

const CompletedSessionCard = ({ session }: CompletedSessionCardProps) => {
  const formattedDate = formatFullDate(session.date);
  const durationText = formatDuration(session.durationSeconds);

  const exerciseText = formatPlural(session.exerciseCount, "exercice");

  return (
    <Link
      to={`/history/${session.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-x-4 rounded-box border border-base-300 bg-base-200 p-4 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
    >
      <h3 className="font-semibold text-base-content first-letter:uppercase">
        {formattedDate}
      </h3>
      <p className="col-start-1 mt-0.5 text-base-content/75 text-sm">
        {durationText} · {exerciseText}
      </p>
      <ChevronRightIcon
        aria-hidden="true"
        className="col-start-2 row-span-2 row-start-1 size-5 text-base-content/50"
      />
    </Link>
  );
};

export default CompletedSessionCard;
