import { Link } from "react-router";
import type { WorkoutSession } from "../../types/workoutSession";
import { formatSessionDateShort } from "../../utils/formatSessionDate";

type PreparedSessionCardProps = {
  session: WorkoutSession;
};

const PreparedSessionCard = ({ session }: PreparedSessionCardProps) => {
  const formattedDate = formatSessionDateShort(session.createdAt);

  return (
    <div className="grid h-full grid-cols-[1fr_auto] items-center gap-x-4 rounded-box border border-base-300 bg-base-200 p-4">
      <p className="font-semibold text-base-content">
        Séance du {formattedDate}
      </p>
      <p className="col-start-1 mt-0.5 text-base-content/75 text-sm">
        {session.exerciseCount}{" "}
        {session.exerciseCount <= 1 ? "exercice" : "exercices"}
      </p>
      <Link
        to={`/sessions/${session.id}`}
        className="col-start-2 row-span-2 row-start-1 rounded-lg bg-secondary px-4 py-3 font-semibold text-secondary-content text-sm transition-colors hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
      >
        Voir la séance
      </Link>
    </div>
  );
};

export default PreparedSessionCard;
