import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import TrashIcon from "../../assets/icons/actions/trash.svg?react";
import { CurrentSessionContext } from "../../contexts/CurrentSessionContext";
import useErrorMessage from "../../hooks/useErrorMessage";
import useAbandonSession from "../../hooks/workout-session/useAbandonSession";
import useDeletePreparedSession from "../../hooks/workout-session/useDeletePreparedSession";
import useStartSession from "../../hooks/workout-session/useStartSession";
import type { WorkoutSessionExercise } from "../../types/sessionExercise";
import type { WorkoutSession } from "../../types/workoutSession";
import { formatFullDate } from "../../utils/formatSessionDate";
import SessionExercisesSection from "../session-exercise/SessionExercisesSection";
import ConflictSessionModal from "./ConflictSessionModal";
import DeleteSessionModal from "./DeleteSessionModal";
import SessionHeader from "./SessionHeader";

type PreparedSessionDetailProps = {
  session: WorkoutSession;
  updateSessionExercises: (exercises: WorkoutSessionExercise[]) => void;
};

const PreparedSessionDetail = ({
  session,
  updateSessionExercises,
}: PreparedSessionDetailProps) => {
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userClosedConflictModal, setUserClosedConflictModal] = useState(false);

  const {
    deletePreparedSession,
    loading: deleteLoading,
    error: deleteError,
  } = useDeletePreparedSession();

  const {
    startSession,
    loading: startLoading,
    error: startError,
    currentSessionId,
  } = useStartSession();

  const {
    abandonSession,
    isAbandoning,
    error: abandonError,
  } = useAbandonSession();

  const currentSessionContext = useContext(CurrentSessionContext);

  useErrorMessage(deleteError);
  useErrorMessage(startError);
  useErrorMessage(abandonError);

  if (currentSessionContext === null) {
    throw new Error("Le contexte de la séance en cours est indisponible");
  }

  const formattedDate = formatFullDate(session.createdAt);
  const exerciseCount = Number(session.exerciseCount);

  const handleDelete = async () => {
    const deleted = await deletePreparedSession(session.id);

    if (deleted) {
      navigate("/sessions");
    }
  };

  const handleStart = async () => {
    const started = await startSession(session.id);

    if (started) {
      await currentSessionContext.refreshCurrentSession();
    } else {
      setUserClosedConflictModal(false);
    }
  };

  const hasOtherSession =
    currentSessionId !== null && currentSessionId !== session.id;

  const isConflictModalOpen = hasOtherSession && !userClosedConflictModal;

  const closeConflictModal = () => {
    setUserClosedConflictModal(true);
  };

  const goToOtherSession = () => {
    navigate(`/sessions/${currentSessionId}`);
  };

  const handleAbandonCurrentSession = async () => {
    if (currentSessionId === null) {
      return;
    }

    const abandoned = await abandonSession(currentSessionId);

    if (abandoned) {
      setUserClosedConflictModal(true);
    }
  };

  return (
    <div className="w-full max-w-3xl pb-32 md:py-4 md:pb-4 lg:px-4">
      <SessionHeader>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={deleteLoading}
          className="-mr-1 flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1.5 font-medium text-error text-sm transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          <TrashIcon aria-hidden="true" className="size-4" />
          {deleteLoading ? "Suppression..." : "Supprimer"}
        </button>
      </SessionHeader>

      <div className="mt-4 flex items-center justify-between gap-3 lg:mt-5">
        <p className="min-w-0 font-semibold capitalize">{formattedDate}</p>

        <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-info/15 px-2.5 py-1 font-semibold text-[11px] text-info uppercase tracking-wide">
          Non démarrée
        </span>
      </div>

      <SessionExercisesSection
        session={session}
        isPrepared={true}
        isInProgress={false}
        updateSessionExercises={updateSessionExercises}
      >
        {exerciseCount > 0 && (
          <button
            type="button"
            onClick={handleStart}
            disabled={startLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3.5 text-center font-semibold text-primary-content text-sm leading-tight transition-colors duration-200 sm:text-sm md:px-5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/35 disabled:hover:border-base-300 disabled:hover:bg-base-200 lg:w-auto"
          >
            {startLoading ? "Démarrage..." : "Démarrer la séance"}
          </button>
        )}
      </SessionExercisesSection>

      {isDeleteModalOpen && (
        <DeleteSessionModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {isConflictModalOpen && (
        <ConflictSessionModal
          isAbandoning={isAbandoning}
          onClose={closeConflictModal}
          onResume={goToOtherSession}
          onAbandon={handleAbandonCurrentSession}
        />
      )}
    </div>
  );
};

export default PreparedSessionDetail;
