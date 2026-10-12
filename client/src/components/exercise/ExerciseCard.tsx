import PlusIcon from "../../assets/icons/actions/plus.svg?react";
import type { ExerciseSummary } from "../../types/exercise";

type ExerciseCardProps = {
  exercise: ExerciseSummary;
  onSelect: (id: number) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  isUnavailable?: boolean;
  onToggleSelect?: (id: number) => void;
};

const PLACEHOLDER = `${import.meta.env.VITE_API_URL}/assets/images/placeholder-exercise.png`;

function ExerciseCard({
  exercise,
  onSelect,
  selectionMode,
  isSelected,
  isUnavailable,
  onToggleSelect,
}: ExerciseCardProps) {
  const imageSrc = `${import.meta.env.VITE_API_URL}${exercise.imageUrl}`;

  if (!selectionMode) {
    return (
      <button
        type="button"
        onClick={() => onSelect(exercise.id)}
        className="group flex w-full items-center gap-3 rounded-xl border border-base-300 bg-base-200 p-3 text-left transition hover:border-primary/60 hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
      >
        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-white">
          <img
            src={imageSrc}
            alt=""
            loading="lazy"
            className="size-full object-contain"
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER;
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-body font-bold text-base-content text-sm">
            {exercise.name}
          </h2>
          <p className="mt-1 truncate text-neutral text-xs">
            {exercise.category}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="shrink-0 text-neutral text-xl transition group-hover:text-primary"
        >
          ›
        </span>
      </button>
    );
  }

  return (
    <div
      className={`relative flex w-full flex-col items-start gap-2 rounded-box border bg-base-200 p-3 transition ${
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-base-300"
      } ${isUnavailable ? "opacity-55" : ""}`}
    >
      <button
        type="button"
        onClick={() => onToggleSelect?.(exercise.id)}
        disabled={isUnavailable}
        aria-pressed={isSelected}
        aria-label={
          isUnavailable
            ? "Exercice déjà ajouté à la séance"
            : isSelected
              ? "Désélectionner cet exercice"
              : "Sélectionner cet exercice"
        }
        className={`absolute right-3 bottom-2 z-10 grid size-7 place-items-center rounded-full border-2 font-bold text-xs transition ${
          isSelected
            ? "border-primary bg-primary text-primary-content"
            : "border-base-content/40 bg-base-100 text-base-content/70"
        } disabled:cursor-not-allowed`}
      >
        {isSelected && <span aria-hidden="true">✓</span>}
        {!isSelected && !isUnavailable && (
          <PlusIcon aria-hidden="true" className="size-4" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelect(exercise.id)}
        className="flex w-full flex-1 flex-col items-start gap-2 text-left"
      >
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full rounded-field bg-white object-contain"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER;
          }}
        />
        <h2 className="font-body font-semibold text-base-content text-sm">
          {exercise.name}
        </h2>
        <span
          className={`badge badge-sm mt-auto border-0 ${
            isUnavailable ? "bg-base-300" : "bg-info/15 text-info"
          }`}
        >
          {isUnavailable ? "Déjà ajouté" : exercise.category}
        </span>
      </button>
    </div>
  );
}

export default ExerciseCard;
