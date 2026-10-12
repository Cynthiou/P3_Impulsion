import { Link, useNavigate } from "react-router";
import ArrowRightIcon from "../../assets/icons/arrows/arrow-right.svg?react";
import CalendarIcon from "../../assets/icons/navigation/calendar-month.svg?react";
import useCreatePreparedSession from "../../hooks/workout-session/useCreatePreparedSession";
import type { WorkoutSession } from "../../types/workoutSession";
import PreparedSessionCard from "./PreparedSessionCard";

type PreparedSessionsListProps = {
  sessions: WorkoutSession[];
  limit?: number;
};

const PreparedSessionsList = ({
  sessions,
  limit,
}: PreparedSessionsListProps) => {
  const navigate = useNavigate();
  const { createPreparedSession, loading: createLoading } =
    useCreatePreparedSession();

  const sessionsList = sessions.filter((s) => s.exerciseCount >= 1);
  const visibleSessions = limit ? sessionsList.slice(0, limit) : sessionsList;
  const draftSession = sessions.find((s) => s.exerciseCount === 0);

  const hasNoSessions = sessionsList.length === 0;
  const isHomePage = limit !== undefined;

  let title = "Aucune séance préparée.";
  let text =
    "Prépare une séance à l'avance pour la retrouver ici, prête à démarrer.";

  if (draftSession) {
    title = "Séance en préparation.";
    text = "Ta séance est créée, ajoute maintenant tes exercices.";
  }

  const handleCreate = async () => {
    if (createLoading) {
      return;
    }

    const sessionId = await createPreparedSession();

    if (sessionId !== null) {
      navigate(`/sessions/${sessionId}`);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-[1fr_auto] items-center gap-x-4">
      <h2 className="font-semibold text-accent text-xs uppercase tracking-widest">
        SÉANCES PRÉPARÉES
      </h2>

      {hasNoSessions && isHomePage && (
        <div className="col-span-2 mt-3 rounded-box border border-base-300 border-dashed p-4 text-base-content/75 text-sm leading-6">
          <p className="max-w-md">{text}</p>
        </div>
      )}

      {hasNoSessions && !isHomePage && (
        <button
          type="button"
          onClick={handleCreate}
          disabled={createLoading}
          className="col-span-2 mt-8 flex w-full flex-col items-center gap-4 rounded-box border border-base-300 border-dashed bg-linear-to-b from-primary/10 to-transparent px-6 py-10 text-center text-base-content/75 text-sm leading-6 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-wait"
        >
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-primary/15 text-primary"
          >
            <CalendarIcon className="size-7" />
          </span>

          <p className="max-w-md">
            <span className="mb-1 block font-display font-extrabold text-base-content text-xl uppercase italic">
              {title}
            </span>{" "}
            {text}
          </p>
        </button>
      )}

      {!hasNoSessions && (
        <ul
          className={`col-span-2 mt-3 grid gap-3 ${
            limit ? "" : "md:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          {visibleSessions.map((session) => (
            <li key={session.id}>
              <PreparedSessionCard session={session} />
            </li>
          ))}
        </ul>
      )}

      {limit && sessionsList.length > limit && (
        <Link
          to="/sessions"
          className="group col-start-2 row-start-1 flex items-center gap-1.5 rounded-field font-semibold text-info text-sm transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
        >
          Voir toutes{" "}
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
};

export default PreparedSessionsList;
