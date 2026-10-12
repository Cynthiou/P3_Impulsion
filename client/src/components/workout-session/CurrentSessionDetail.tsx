import { useState } from "react";
import { useNavigate } from "react-router";
import type { WorkoutSessionExercise } from "../../types/sessionExercise";
import type { WorkoutSession } from "../../types/workoutSession";
import { formatFullDate } from "../../utils/formatSessionDate";
import SessionExercisesSection from "../session-exercise/SessionExercisesSection";
import AbandonSessionModal from "./AbandonSessionModal";
import Chrono from "./Chrono";
import SessionHeader from "./SessionHeader";

type CurrentSessionDetailProps = {
  session: WorkoutSession;
  startedAt: string | null;
  updateSessionExercises: (exercises: WorkoutSessionExercise[]) => void;
  onSetCompletionChange: (change: number) => void;
};

const CurrentSessionDetail = ({
  session,
  startedAt,
  updateSessionExercises,
  onSetCompletionChange,
}: CurrentSessionDetailProps) => {
  const navigate = useNavigate();

  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);

  const formattedDate = formatFullDate(session.createdAt);

  let hasCompletedSets = false;

  if (
    session.completedSetCount !== undefined &&
    session.completedSetCount > 0
  ) {
    hasCompletedSets = true;
  }

  const afterAbandon = () => {
    setIsAbandonModalOpen(false);
    navigate("/sessions");
  };

  return (
    <div className="w-full max-w-3xl pb-32 md:py-4 md:pb-4 lg:px-4">
      <SessionHeader>
        {!hasCompletedSets && (
          <button
            type="button"
            onClick={() => setIsAbandonModalOpen(true)}
            className="-mr-1 flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1.5 font-medium text-error text-sm transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2"
          >
            <span aria-hidden="true" className="text-base leading-none">
              &times;
            </span>
            Abandonner
          </button>
        )}
      </SessionHeader>

      <div className="mt-4 flex items-center justify-between gap-3 lg:mt-5">
        <p className="min-w-0 font-semibold capitalize">{formattedDate}</p>

        {startedAt !== null && <Chrono startedAt={startedAt} />}
      </div>

      <SessionExercisesSection
        session={session}
        isPrepared={false}
        isInProgress={true}
        updateSessionExercises={updateSessionExercises}
        onSetCompletionChange={onSetCompletionChange}
      >
        <button
          type="button"
          onClick={() => navigate(`/sessions/${session.id}/summary`)}
          disabled={!hasCompletedSets}
          title={
            hasCompletedSets
              ? undefined
              : "Validez au moins une série pour terminer la séance"
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3.5 text-center font-semibold text-primary-content text-sm leading-tight transition-colors duration-200 sm:text-sm md:px-5 hover:border-info hover:bg-info hover:text-white focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/35 disabled:hover:border-base-300 disabled:hover:bg-base-200 lg:w-auto"
        >
          Valider la séance
        </button>
      </SessionExercisesSection>

      {isAbandonModalOpen && (
        <AbandonSessionModal
          sessionId={session.id}
          onClose={() => setIsAbandonModalOpen(false)}
          onAbandoned={afterAbandon}
        />
      )}
    </div>
  );
};

export default CurrentSessionDetail;
