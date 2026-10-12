import ArrowRightIcon from "../../assets/icons/arrows/arrow-right.svg?react";
import ClockIcon from "../../assets/icons/seance/clock.svg?react";
import useChrono from "../../hooks/workout-session/useChrono";
import type { WorkoutSession } from "../../types/workoutSession";
import { formatPlural } from "../../utils/formatPlural";

type HomeActionButtonProps = {
  currentSession: WorkoutSession | null;
  hasDraft: boolean;
  onAction: () => void;
  isLoading: boolean;
};

const HomeActionButton = ({
  currentSession,
  hasDraft,
  onAction,
  isLoading,
}: HomeActionButtonProps) => {
  const startedAt = currentSession !== null ? currentSession.startedAt : null;
  const chrono = useChrono(startedAt);

  let actionTitle = "";
  let actionDescription = "";
  let descriptionColorClassName = "text-base-content/75";

  if (currentSession !== null) {
    actionTitle = "REPRENDRE MA SÉANCE";
    descriptionColorClassName = "text-info";
    actionDescription = `${chrono} · ${formatPlural(currentSession.exerciseCount, "exercice")}`;
  } else if (hasDraft) {
    actionTitle = "AJOUTER DES EXERCICES";
    actionDescription = "Ta séance est créée, ajoute maintenant tes exercices.";
  } else {
    actionTitle = "CRÉER UNE SÉANCE";
    actionDescription = "Ajoute tes exercices, puis démarre quand tu veux.";
  }

  return (
    <div className="relative mt-5 grid lg:mt-6 lg:p-8 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-box border-2 border-primary bg-base-200 p-5 shadow-primary/25 shadow-xl transition-colors has-[button:hover]:bg-base-300">
      <p
        className={`col-start-1 row-start-2 flex items-center gap-1.5 text-sm leading-5 ${descriptionColorClassName}`}
      >
        {currentSession !== null && (
          <ClockIcon aria-hidden="true" className="size-4" />
        )}
        {actionDescription}
      </p>

      <button
        type="button"
        onClick={onAction}
        disabled={isLoading}
        className="col-start-1 row-start-1 text-left font-display font-extrabold text-2xl uppercase italic leading-tight after:absolute after:inset-0 after:rounded-box focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-info focus-visible:after:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        {isLoading ? "Chargement..." : actionTitle}
      </button>

      <span
        aria-hidden="true"
        className="col-start-2 row-span-2 row-start-1 grid size-12 place-items-center rounded-full lg:size-14 bg-primary text-primary-content shadow-primary/60 shadow-xl ring-4 ring-primary/20"
      >
        <ArrowRightIcon className="size-5" />
      </span>
    </div>
  );
};

export default HomeActionButton;
