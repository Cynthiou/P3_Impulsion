import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import BarbellIcon from "../../assets/icons/navigation/barbell.svg?react";
import { useMessages } from "../../contexts/MessageContext";
import useDeleteSessionExercise from "../../hooks/session-exercise/useDeleteSessionExercise";
import useReorderSessionExercises from "../../hooks/session-exercise/useReorderSessionExercises";
import useUpdateSessionExerciseRest from "../../hooks/session-exercise/useUpdateSessionExerciseRest";
import type { WorkoutSessionExercise } from "../../types/sessionExercise";
import type { WorkoutSession } from "../../types/workoutSession";
import { formatPlural } from "../../utils/formatPlural";
import ExerciseDetailSheet from "../exercise/ExerciseDetailSheet";
import PreparedExerciseCard from "./PreparedExerciseCard";

type SessionExercisesSectionProps = {
  session: WorkoutSession;
  isPrepared: boolean;
  isInProgress: boolean;
  updateSessionExercises: (exercises: WorkoutSessionExercise[]) => void;
  children: ReactNode;
};

const SessionExercisesSection = ({
  session,
  isPrepared,
  isInProgress,
  updateSessionExercises,
  children,
}: SessionExercisesSectionProps) => {
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
    updateSessionExerciseRest,
    updatingExerciseId,
    error: restError,
  } = useUpdateSessionExerciseRest();

  const {
    deleteSessionExercise,
    deletingExerciseId,
    error: removeExerciseError,
  } = useDeleteSessionExercise();

  const { showMessage } = useMessages();

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

  const exercises = session.exercises ?? [];
  const exerciseCount = Number(session.exerciseCount);

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

  return (
    <>
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

          {children}
        </div>
      </div>

      <ExerciseDetailSheet
        exerciseId={selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
      />
    </>
  );
};

export default SessionExercisesSection;
