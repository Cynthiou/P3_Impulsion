import TrashIcon from "../../assets/icons/actions/trash.svg?react";
import ChevronDownIcon from "../../assets/icons/chevrons/chevron-down.svg?react";
import ChevronUpIcon from "../../assets/icons/chevrons/chevron-up.svg?react";
import InfoIcon from "../../assets/icons/etats/info-circle.svg?react";
import type { WorkoutSessionExercise } from "../../types/sessionExercise";
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
  onOpenDetail: () => void;
  isOpen: boolean;
  onOpen: () => void;
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
  onOpenDetail,
  isOpen,
  onOpen,
}: PreparedExerciseCardProps) {
  return (
    <article className="relative rounded-box border border-base-300 bg-base-200 p-3">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 flex-col items-center">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp || disabled}
            aria-label={`Monter ${exercise.name}`}
            className="grid size-7 place-items-center rounded-md text-base-content/70 transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronUpIcon aria-hidden="true" className="size-4" />
          </button>

          <span className="font-display font-extrabold text-lg text-secondary italic leading-none">
            {exercise.position}
          </span>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown || disabled}
            aria-label={`Descendre ${exercise.name}`}
            className="grid size-7 place-items-center rounded-md text-base-content/70 transition hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-20"
          >
            <ChevronDownIcon aria-hidden="true" className="size-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base-content">{exercise.name}</h3>
          <RestTimeSelector
            value={exercise.restSeconds}
            onChange={onRestChange}
            disabled={restDisabled}
            editable={canEditRest}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onOpenDetail}
            aria-label={`Voir la fiche de ${exercise.name}`}
            className="grid size-8 place-items-center rounded-lg text-info transition hover:bg-info/10"
          >
            <InfoIcon aria-hidden="true" className="size-5" />
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              disabled={removeDisabled}
              aria-label={`Retirer ${exercise.name} de la séance`}
              className="grid size-8 place-items-center rounded-lg text-base-content/60 transition hover:bg-error/10 hover:text-error disabled:cursor-wait disabled:opacity-30"
            >
              <TrashIcon aria-hidden="true" className="size-5" />
            </button>
          )}

          {canManageSets && !isOpen && (
            <button
              type="button"
              onClick={onOpen}
              aria-label={`Afficher les séries de ${exercise.name}`}
              className="grid size-8 place-items-center rounded-lg text-base-content/60 transition hover:bg-base-300 hover:text-base-content"
            >
              <ChevronDownIcon aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      </div>

      {canManageSets && isOpen && (
        <ExerciseSetManager
          sessionExerciseId={exercise.sessionExerciseId}
          targetReps={exercise.targetReps}
          targetWeightKg={exercise.targetWeightKg}
          targetDurationSeconds={exercise.targetDurationSeconds}
        />
      )}
    </article>
  );
}

export default PreparedExerciseCard;
