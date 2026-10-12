import ChevronDownIcon from "../assets/icons/chevrons/chevron-down.svg?react";
import ChevronUpIcon from "../assets/icons/chevrons/chevron-up.svg?react";
import type { WorkoutSessionExercise } from "../types/workoutSession";
import ExerciseSetManager from "./ExerciseSetManager";
import RestTimeSelector from "./RestTimeSelector";

type PreparedExerciseCardProps = {
  exercise: WorkoutSessionExercise;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  canEditRest: boolean;
  restDisabled: boolean;
  onRestChange: (restSeconds: number | null) => void;
  canRemove: boolean;
  removeDisabled: boolean;
  onRemove: () => void;
  canManageSets: boolean;
  onSetCompletionChange: (change: number) => void;
};

function PreparedExerciseCard({
  exercise,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled,
  canEditRest,
  restDisabled,
  onRestChange,
  canRemove,
  removeDisabled,
  onRemove,
  canManageSets,
  onSetCompletionChange,
}: PreparedExerciseCardProps) {
  return (
    <article className="rounded-box border border-base-300 bg-linear-to-b from-base-300/35 to-base-200 p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary/20 font-display font-extrabold text-base text-secondary italic ring-1 ring-secondary/30">
          {exercise.position}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base-content">{exercise.name}</h3>
          <p className="mt-1 text-neutral text-sm">{exercise.category}</p>
          <RestTimeSelector
            value={exercise.restSeconds}
            onChange={onRestChange}
            disabled={restDisabled}
            editable={canEditRest}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={removeDisabled}
              aria-label={`Retirer ${exercise.name} de la séance`}
              className="grid size-9 place-items-center rounded-lg border border-error/40 font-semibold text-error text-xl leading-none transition hover:border-error hover:bg-error/10 disabled:cursor-wait disabled:opacity-30"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          )}

          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || disabled}
            aria-label={`Monter ${exercise.name}`}
            className="grid size-9 place-items-center rounded-lg border border-base-300 text-base-content transition hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUpIcon aria-hidden="true" className="size-4" />
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || disabled}
            aria-label={`Descendre ${exercise.name}`}
            className="grid size-9 place-items-center rounded-lg border border-base-300 text-base-content transition hover:border-primary hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDownIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      {canManageSets && (
        <ExerciseSetManager
          sessionExerciseId={exercise.sessionExerciseId}
          targetReps={exercise.targetReps}
          targetWeightKg={exercise.targetWeightKg}
          targetDurationSeconds={exercise.targetDurationSeconds}
          onCompletionChange={onSetCompletionChange}
        />
      )}
    </article>
  );
}

export default PreparedExerciseCard;
