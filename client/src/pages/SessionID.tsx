import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import TrashIcon from "../assets/icons/actions/trash.svg?react";
import ChevronLeftIcon from "../assets/icons/chevrons/chevron-left.svg?react";
import BarbellIcon from "../assets/icons/navigation/barbell.svg?react";
import ExerciseDetailSheet from "../components/exercise/ExerciseDetailSheet";
import CompletedSessionView from "../components/history/CompletedSessionView";
import PreparedExerciseCard from "../components/session-exercise/PreparedExerciseCard";
import AbandonSessionModal from "../components/workout-session/AbandonSessionModal";
import Chrono from "../components/workout-session/Chrono";
import ConflictSessionModal from "../components/workout-session/ConflictSessionModal";
import DeleteSessionModal from "../components/workout-session/DeleteSessionModal";
import { CurrentSessionContext } from "../contexts/CurrentSessionContext";
import { useMessages } from "../contexts/MessageContext";
import useDeleteSessionExercise from "../hooks/session-exercise/useDeleteSessionExercise";
import useReorderSessionExercises from "../hooks/session-exercise/useReorderSessionExercises";
import useUpdateSessionExerciseRest from "../hooks/session-exercise/useUpdateSessionExerciseRest";
import useAbandonSession from "../hooks/workout-session/useAbandonSession";
import useDeletePreparedSession from "../hooks/workout-session/useDeletePreparedSession";
import useStartSession from "../hooks/workout-session/useStartSession";
import useWorkoutSession from "../hooks/workout-session/useWorkoutSession";
import { formatPlural } from "../utils/formatPlural";
import { formatFullDate } from "../utils/formatSessionDate";

function SessionId() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sessionId = Number(id);
  const { session, loading, error, updateSessionExercises } =
    useWorkoutSession(sessionId);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
  const [userClosedConflictModal, setUserClosedConflictModal] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );
  const [openedExerciseId, setOpenedExerciseId] = useState<number | null>(null);

  const {
    reorderSessionExercises,
    loading: reorderLoading,
    error: reorderError,
  } = useReorderSessionExercises();

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

  const {
    updateSessionExerciseRest,
    updatingExerciseId,
    error: restError,
  } = useUpdateSessionExerciseRest();

  const {
    deleteSessionExercise,
    deletingExerciseId,
    error: removeExerciseError,
  } = useDeleteSessionExercise();

  const currentSessionContext = useContext(CurrentSessionContext);
  const { showMessage } = useMessages();

  useEffect(() => {
    if (deleteError !== null) {
      showMessage(deleteError, "error");
    }
  }, [deleteError, showMessage]);

  useEffect(() => {
    if (startError !== null) {
      showMessage(startError, "error");
    }
  }, [startError, showMessage]);

  useEffect(() => {
    if (abandonError !== null) {
      showMessage(abandonError, "error");
    }
  }, [abandonError, showMessage]);

  useEffect(() => {
    if (restError !== null) {
      showMessage(restError, "error");
    }
  }, [restError, showMessage]);

  useEffect(() => {
    if (removeExerciseError !== null) {
      showMessage(removeExerciseError, "error");
    }
  }, [removeExerciseError, showMessage]);

  if (currentSessionContext === null) {
    throw new Error("Le contexte de la séance en cours est indisponible");
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!session) {
    return <p>Séance introuvable.</p>;
  }

  if (session.status === "completed") {
    return <CompletedSessionView sessionId={session.id} />;
  }

  const formattedDate = formatFullDate(session.createdAt);

  const exercises = session.exercises ?? [];
  const exerciseCount = Number(session.exerciseCount);

  const handleDelete = async () => {
    const deleted = await deletePreparedSession(session.id);

    if (deleted) {
      navigate("/sessions");
    }
  };

  const handleMoveExercise = async (
    currentIndex: number,
    direction: -1 | 1,
  ) => {
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= exercises.length) {
      return;
    }

    const nextExercises = [...exercises];

    [nextExercises[currentIndex], nextExercises[targetIndex]] = [
      nextExercises[targetIndex],
      nextExercises[currentIndex],
    ];

    const sessionExerciseIds = nextExercises.map(
      (exercise) => exercise.sessionExerciseId,
    );

    const reordered = await reorderSessionExercises(
      session.id,
      sessionExerciseIds,
    );

    if (!reordered) {
      return;
    }

    updateSessionExercises(
      nextExercises.map((exercise, index) => ({
        ...exercise,
        position: index + 1,
      })),
    );
  };

  const handleStart = async () => {
    const started = await startSession(session.id);

    if (started) {
      await currentSessionContext.refreshCurrentSession();
    } else {
      setUserClosedConflictModal(false);
    }
  };

  const handleRestChange = async (
    sessionExerciseId: number,
    restSeconds: number | null,
  ) => {
    const updated = await updateSessionExerciseRest(
      session.id,
      sessionExerciseId,
      restSeconds,
    );

    if (!updated) {
      return;
    }

    updateSessionExercises(
      exercises.map((exercise) =>
        exercise.sessionExerciseId === sessionExerciseId
          ? { ...exercise, restSeconds }
          : exercise,
      ),
    );
  };

  const handleRemoveExercise = async (sessionExerciseId: number) => {
    const deleted = await deleteSessionExercise(session.id, sessionExerciseId);

    if (!deleted) {
      return;
    }

    updateSessionExercises(
      exercises
        .filter((exercise) => exercise.sessionExerciseId !== sessionExerciseId)
        .map((exercise, index) => ({
          ...exercise,
          position: index + 1,
        })),
    );
    showMessage("Exercice retiré de la séance", "success");
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

  const afterAbandon = () => {
    setIsAbandonModalOpen(false);
    navigate("/sessions");
  };

  const currentSession = currentSessionContext.currentSession;

  const isCurrentSession =
    currentSession !== null && currentSession.id === session.id;

  const isInProgress = session.status === "in_progress" || isCurrentSession;

  const isPrepared = session.status === "prepared" && !isInProgress;

  let hasCompletedSets = false;

  if (
    session.completedSetCount !== undefined &&
    session.completedSetCount > 0
  ) {
    hasCompletedSets = true;
  }

  let startedAt = session.startedAt;

  if (isCurrentSession) {
    startedAt = currentSession.startedAt;
  }

  return (
    <div className="w-full max-w-3xl pb-32 md:py-4 md:pb-4 lg:px-4">
      <div className="flex items-center justify-between gap-2 border-base-300 border-b pb-4 lg:pb-6">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            to="/sessions"
            aria-label="Retour aux séances"
            className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-base-content transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
          >
            <ChevronLeftIcon aria-hidden="true" className="size-6" />
          </Link>

          <h1 className="whitespace-nowrap py-0.5 font-display font-extrabold text-2xl uppercase italic leading-snug lg:text-4xl">
            Ma séance
          </h1>
        </div>

        {isPrepared && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={deleteLoading}
            className="-mr-1 flex shrink-0 items-center gap-1.5 rounded-lg px-1.5 py-1.5 font-medium text-error text-sm transition-colors hover:bg-error/10 focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <TrashIcon aria-hidden="true" className="size-4" />
            {deleteLoading ? "Suppression..." : "Supprimer"}
          </button>
        )}

        {isInProgress && !hasCompletedSets && (
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
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 lg:mt-5">
        <p className="min-w-0 font-semibold capitalize">{formattedDate}</p>

        {isInProgress && startedAt !== null && <Chrono startedAt={startedAt} />}

        {!isInProgress && (
          <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-info/15 px-2.5 py-1 font-semibold text-[11px] text-info uppercase tracking-wide">
            Non démarrée
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <h2 className="font-semibold text-accent text-xs uppercase tracking-widest">
          Exercices
        </h2>

        <p className="text-base-content/75 text-sm">
          {formatPlural(exerciseCount, "exercice")}
        </p>
      </div>
      {reorderError && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-error text-sm"
        >
          {reorderError}
        </p>
      )}
      <div
        className={`mt-3 ${
          exerciseCount === 0
            ? "md:rounded-box md:border md:border-base-300 md:border-dashed md:bg-linear-to-b md:from-primary/10 md:to-transparent md:px-6 md:py-12"
            : ""
        }`}
      >
        {exerciseCount === 0 ? (
          <Link
            to={`/sessions/${session.id}/exercises`}
            className="flex flex-col items-center gap-4 rounded-box border border-base-300 border-dashed bg-linear-to-b from-primary/10 to-transparent px-6 py-10 text-center transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 md:border-0 md:bg-none md:p-0"
          >
            <span
              aria-hidden="true"
              className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/15 text-primary md:size-16"
            >
              <BarbellIcon className="size-7" />
            </span>

            <div>
              <h3 className="mb-1 font-display font-extrabold text-base-content text-xl uppercase italic md:text-2xl">
                Ajoutez votre premier exercice
              </h3>

              <p className="mx-auto max-w-sm text-base-content/75 text-sm leading-6">
                Appuie ici pour ajouter des exercices, une séance vide ne peut
                pas être démarrée.
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            {exercises.map((exercise, index) => (
              <PreparedExerciseCard
                key={exercise.sessionExerciseId}
                exercise={exercise}
                onMoveUp={() => handleMoveExercise(index, -1)}
                onMoveDown={() => handleMoveExercise(index, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < exercises.length - 1}
                disabled={reorderLoading || deletingExerciseId !== null}
                canEditRest={isPrepared}
                restDisabled={
                  updatingExerciseId !== null || deletingExerciseId !== null
                }
                onRestChange={(restSeconds) =>
                  handleRestChange(exercise.sessionExerciseId, restSeconds)
                }
                canRemove={isPrepared}
                removeDisabled={deletingExerciseId !== null || reorderLoading}
                onRemove={() =>
                  handleRemoveExercise(exercise.sessionExerciseId)
                }
                canManageSets={isInProgress}
                onOpenDetail={() => setSelectedExerciseId(exercise.id)}
                isOpen={openedExerciseId === exercise.sessionExerciseId}
                onOpen={() => setOpenedExerciseId(exercise.sessionExerciseId)}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:justify-end">
          <Link
            to={`/sessions/${session.id}/exercises`}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-center font-semibold text-sm leading-tight transition-colors duration-200 sm:text-sm md:px-5 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 lg:w-auto ${
              exerciseCount === 0
                ? "border-primary bg-primary text-primary-content hover:border-info hover:bg-info hover:text-white"
                : "border-base-content/40 bg-base-100 hover:border-info hover:bg-info/10 hover:text-info md:bg-transparent"
            }`}
          >
            Ajouter des exercices
          </Link>

          {isPrepared && (
            <button
              type="button"
              onClick={handleStart}
              disabled={exerciseCount === 0 || startLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-3.5 text-center font-semibold text-primary-content text-sm leading-tight transition-colors duration-200 sm:text-sm md:px-5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/35 disabled:hover:border-base-300 disabled:hover:bg-base-200 lg:w-auto"
            >
              {startLoading ? "Démarrage..." : "Démarrer la séance"}
            </button>
          )}

          {isInProgress && (
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
          )}
        </div>
      </div>

      {isPrepared && isDeleteModalOpen && (
        <DeleteSessionModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
      {isInProgress && isAbandonModalOpen && (
        <AbandonSessionModal
          sessionId={session.id}
          onClose={() => setIsAbandonModalOpen(false)}
          onAbandoned={afterAbandon}
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

      <ExerciseDetailSheet
        exerciseId={selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
      />
    </div>
  );
}

export default SessionId;
