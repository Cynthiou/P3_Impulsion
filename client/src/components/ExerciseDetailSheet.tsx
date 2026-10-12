import { useEffect, useRef } from "react";
import useExerciseDetail from "../hooks/exercise/useExerciseDetail";
import ExerciseDetailContent from "./exercise-detail/ExerciseDetailContent";
import ExerciseDetailSkeleton from "./exercise-detail/ExerciseDetailSkeleton";
import LocalErrorState from "./feedback/LocalErrorState";

type ExerciseDetailSheetProps = {
  exerciseId: number | null;
  onClose: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  isUnavailable?: boolean;
  onToggleSelect?: (id: number) => void;
};

function ExerciseDetailSheet({
  exerciseId,
  onClose,
  selectionMode,
  isSelected,
  isUnavailable,
  onToggleSelect,
}: ExerciseDetailSheetProps) {
  const { exerciseDetail, isLoading, error, notFound, retry } =
    useExerciseDetail(exerciseId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (exerciseId === null) {
      return;
    }

    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || dialogRef.current === null) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement =
        focusableElements[focusableElements.length - 1];

      if (
        firstFocusableElement === undefined ||
        lastFocusableElement === undefined
      ) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastFocusableElement
      ) {
        event.preventDefault();
        firstFocusableElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [exerciseId, onClose]);

  if (exerciseId === null) {
    return null;
  }

  const showSelectionAction =
    selectionMode &&
    !isLoading &&
    error === null &&
    !notFound &&
    exerciseDetail !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 backdrop-blur-sm md:items-stretch md:justify-end">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fermer la fiche exercice"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <dialog
        ref={dialogRef}
        open
        aria-modal="true"
        aria-labelledby="exercise-detail-title"
        className="relative z-10 m-0 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border-base-300 border-t bg-base-200 p-0 text-base-content shadow-2xl md:h-dvh md:max-h-dvh md:max-w-xl md:rounded-none md:border-t-0 md:border-l"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-base-content/20 md:hidden"
        />

        <header className="flex shrink-0 items-start justify-between gap-4 border-base-300 border-b px-5 py-4 md:px-7 md:py-6">
          <div className="min-w-0">
            <h2
              id="exercise-detail-title"
              className="font-display font-extrabold text-2xl text-base-content uppercase italic leading-none md:text-3xl"
            >
              {exerciseDetail?.name ?? "Exercice"}
            </h2>
            {exerciseDetail !== null && (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 text-info text-xs">
                <span>{exerciseDetail.category}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {exerciseDetail.equipment.length === 0
                    ? "Sans matériel"
                    : exerciseDetail.equipment
                        .map((item) => item.name)
                        .join(", ")}
                </span>
                <span aria-hidden="true">·</span>
                <span>{exerciseDetail.difficulty}</span>
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fermer la fiche exercice"
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-base-300 text-base-content transition-colors hover:bg-primary hover:text-primary-content focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          {isLoading && <ExerciseDetailSkeleton />}

          {!isLoading && error !== null && (
            <LocalErrorState
              message="Impossible de charger cet exercice."
              onRetry={retry}
            />
          )}

          {!isLoading && error === null && notFound && (
            <div
              aria-live="polite"
              className="rounded-box border border-base-300 bg-base-100 p-8 text-center"
            >
              <p className="font-display font-bold text-base-content text-xl uppercase">
                Cet exercice n’existe pas.
              </p>
            </div>
          )}

          {!isLoading &&
            error === null &&
            !notFound &&
            exerciseDetail !== null && (
              <ExerciseDetailContent exercise={exerciseDetail} />
            )}
        </div>

        {showSelectionAction && (
          <footer className="shrink-0 border-base-300 border-t px-5 py-4 md:px-7">
            <button
              type="button"
              onClick={() => onToggleSelect?.(exerciseId)}
              disabled={isUnavailable}
              aria-pressed={isSelected}
              className={`w-full rounded-lg px-4 py-3 font-semibold text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? "border border-primary bg-primary/10 text-primary"
                  : "bg-primary text-primary-content"
              }`}
            >
              {isUnavailable
                ? "Déjà ajouté à la séance"
                : isSelected
                  ? "Retirer de la sélection"
                  : "Sélectionner cet exercice"}
            </button>
          </footer>
        )}
      </dialog>
    </div>
  );
}

export default ExerciseDetailSheet;
