import { useState } from "react";
import { useMessages } from "../contexts/MessageContext";
import useExerciseSets from "../hooks/workout-session/useExerciseSets";
import type {
  CreateExerciseSet,
  ExerciseSet,
  UpdateExerciseSet,
} from "../types/workoutSession";

type ExerciseSetManagerProps = {
  sessionExerciseId: number;
  targetReps: number | null;
  targetWeightKg: number | string | null;
  targetDurationSeconds: number | null;
  onCompletionChange: (change: number) => void;
};

const parseOptionalNumber = (value: string) => {
  return value === "" ? null : Number(value);
};

const getValidationError = (
  values: CreateExerciseSet,
  repetitionsRequired = false,
) => {
  if (
    values.repetitions === null &&
    values.weightKg === null &&
    values.durationSeconds === null
  ) {
    return "Renseigne au moins une valeur";
  }

  if (
    values.repetitions !== null &&
    (!Number.isInteger(values.repetitions) || values.repetitions <= 0)
  ) {
    return "Le nombre de répétitions est invalide";
  }

  if (
    values.weightKg !== null &&
    (!Number.isFinite(values.weightKg) || values.weightKg <= 0)
  ) {
    return "La charge est invalide";
  }

  if (
    values.durationSeconds !== null &&
    (!Number.isInteger(values.durationSeconds) || values.durationSeconds <= 0)
  ) {
    return "La durée est invalide";
  }

  if (repetitionsRequired && values.repetitions === null) {
    return "Renseigne les répétitions avant de valider la série";
  }

  return null;
};

type ExerciseSetFormProps = {
  setNumber: number;
  previousSet:
    | Pick<ExerciseSet, "repetitions" | "weightKg" | "durationSeconds">
    | undefined;
  saving: boolean;
  onAdd: (values: CreateExerciseSet) => Promise<ExerciseSet | null>;
};

function ExerciseSetForm({
  setNumber,
  previousSet,
  saving,
  onAdd,
}: ExerciseSetFormProps) {
  const [repetitions, setRepetitions] = useState(
    previousSet?.repetitions?.toString() ?? "",
  );
  const [weightKg, setWeightKg] = useState(
    previousSet?.weightKg?.toString() ?? "",
  );
  const [durationSeconds, setDurationSeconds] = useState(
    previousSet?.durationSeconds?.toString() ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const { showMessage } = useMessages();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values = {
      repetitions: parseOptionalNumber(repetitions),
      weightKg: parseOptionalNumber(weightKg),
      durationSeconds: parseOptionalNumber(durationSeconds),
    };

    const validationError = getValidationError(values);

    if (validationError !== null) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    const newSet = await onAdd(values);

    if (newSet !== null) {
      showMessage(`Série ${newSet.setNumber} enregistrée`, "success");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <h5 className="font-semibold text-primary text-sm">Série {setNumber}</h5>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Répétitions
          <input
            type="number"
            min="1"
            step="1"
            value={repetitions}
            onChange={(event) => setRepetitions(event.target.value)}
            className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          Charge (kg)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          Durée (s)
          <input
            type="number"
            min="1"
            step="1"
            value={durationSeconds}
            onChange={(event) => setDurationSeconds(event.target.value)}
            className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2 py-2 text-base"
          />
        </label>
      </div>

      {formError !== null && (
        <p role="alert" className="text-error text-sm">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg border border-primary bg-primary px-4 py-2.5 font-semibold text-primary-content text-sm transition-colors hover:border-info hover:bg-info disabled:cursor-wait disabled:border-base-300 disabled:bg-base-300 disabled:text-base-content/50"
      >
        {saving ? "Enregistrement..." : "+ Ajouter une série"}
      </button>
    </form>
  );
}

type ExerciseSetRowProps = {
  set: ExerciseSet;
  updating: boolean;
  onUpdate: (
    exerciseSetId: number,
    values: UpdateExerciseSet,
  ) => Promise<ExerciseSet | null>;
  onCompletionChange: (change: number) => void;
};

function ExerciseSetRow({
  set,
  updating,
  onUpdate,
  onCompletionChange,
}: ExerciseSetRowProps) {
  const [repetitions, setRepetitions] = useState(
    set.repetitions?.toString() ?? "",
  );
  const [weightKg, setWeightKg] = useState(set.weightKg?.toString() ?? "");
  const [durationSeconds, setDurationSeconds] = useState(
    set.durationSeconds?.toString() ?? "",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const { showMessage } = useMessages();

  const handleCompletion = async () => {
    const nextIsCompleted = !set.isCompleted;
    const values = {
      repetitions: parseOptionalNumber(repetitions),
      weightKg: parseOptionalNumber(weightKg),
      durationSeconds: parseOptionalNumber(durationSeconds),
    };
    const validationError = getValidationError(values, nextIsCompleted);

    if (validationError !== null) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    const updatedSet = await onUpdate(set.id, {
      ...values,
      isCompleted: nextIsCompleted,
    });

    if (updatedSet !== null) {
      onCompletionChange(nextIsCompleted ? 1 : -1);
      showMessage(
        nextIsCompleted ? "Série réalisée" : "Série remise à faire",
        "success",
      );
    }
  };

  return (
    <li className="rounded-lg bg-base-300/50 px-3 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">Série {set.setNumber}</span>
        <span className="text-base-content/60 text-xs">
          {set.isCompleted ? "Réalisée" : "À faire"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-xs">
          Répétitions
          <input
            type="number"
            min="1"
            step="1"
            value={repetitions}
            disabled={set.isCompleted || updating}
            onChange={(event) => setRepetitions(event.target.value)}
            className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2 py-2 text-base disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          Charge (kg)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={weightKg}
            disabled={set.isCompleted || updating}
            onChange={(event) => setWeightKg(event.target.value)}
            className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2 py-2 text-base disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs">
          Durée (s)
          <input
            type="number"
            min="1"
            step="1"
            value={durationSeconds}
            disabled={set.isCompleted || updating}
            onChange={(event) => setDurationSeconds(event.target.value)}
            className="min-w-0 rounded-lg border border-base-300 bg-base-100 px-2 py-2 text-base disabled:opacity-60"
          />
        </label>
      </div>

      {formError !== null && (
        <p role="alert" className="mt-2 text-error text-sm">
          {formError}
        </p>
      )}

      <button
        type="button"
        onClick={handleCompletion}
        disabled={updating}
        aria-pressed={set.isCompleted}
        className={`mt-3 w-full rounded-lg border px-4 py-2.5 font-semibold text-sm transition-colors disabled:cursor-wait disabled:opacity-60 ${
          set.isCompleted
            ? "border-base-content/30 bg-base-100 text-base-content hover:border-error hover:text-error"
            : "border-success bg-success text-success-content hover:opacity-90"
        }`}
      >
        {updating ? "Enregistrement..." : set.isCompleted ? "Annuler" : "Fait"}
      </button>
    </li>
  );
}

function ExerciseSetManager({
  sessionExerciseId,
  targetReps,
  targetWeightKg,
  targetDurationSeconds,
  onCompletionChange,
}: ExerciseSetManagerProps) {
  const { sets, loading, saving, updatingSetId, error, addSet, updateSet } =
    useExerciseSets(sessionExerciseId);
  const previousSet = sets.at(-1);
  const nextSetNumber = (previousSet?.setNumber ?? 0) + 1;
  const suggestedValues = previousSet ?? {
    repetitions: targetReps,
    weightKg: targetWeightKg,
    durationSeconds: targetDurationSeconds,
  };

  return (
    <div className="mt-4 border-base-300 border-t pt-4">
      <h4 className="font-semibold text-sm">Séries</h4>

      {loading ? (
        <p className="mt-2 text-base-content/65 text-sm">
          Chargement des séries...
        </p>
      ) : sets.length === 0 ? (
        <p className="mt-2 text-base-content/65 text-sm">
          Aucune série enregistrée
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sets.map((set) => (
            <ExerciseSetRow
              key={set.id}
              set={set}
              updating={updatingSetId === set.id}
              onUpdate={updateSet}
              onCompletionChange={onCompletionChange}
            />
          ))}
        </ul>
      )}

      {error !== null && (
        <p role="alert" className="mt-3 text-error text-sm">
          {error}
        </p>
      )}

      {!loading && (
        <ExerciseSetForm
          key={nextSetNumber}
          setNumber={nextSetNumber}
          previousSet={suggestedValues}
          saving={saving}
          onAdd={addSet}
        />
      )}
    </div>
  );
}

export default ExerciseSetManager;
