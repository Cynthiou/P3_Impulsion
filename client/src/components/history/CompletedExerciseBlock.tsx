import InfoIcon from "../../assets/icons/etats/info-circle.svg?react";
import type { DetailExerciseWithSets } from "../../types/workoutSession";
import { formatReps } from "../../utils/formatReps";
import { formatWeight } from "../../utils/formatWeight";

type CompletedExerciseBlockProps = {
  exercise: DetailExerciseWithSets;
  onOpenDetail: (exerciseId: number) => void;
};

function CompletedExerciseBlock({
  exercise,
  onOpenDetail,
}: CompletedExerciseBlockProps) {
  const hasSets = exercise.sets.length > 0;

  return (
    <article className="overflow-hidden rounded-box border border-info/60 bg-base-200">
      <div className="flex items-center justify-between gap-3 border-base-300 border-b px-4 py-3">
        <h3 className="font-semibold text-base-content">
          {exercise.position} · {exercise.name}
        </h3>

        <button
          type="button"
          onClick={() => onOpenDetail(exercise.id)}
          aria-label={`Voir la fiche de ${exercise.name}`}
          className="grid size-8 shrink-0 place-items-center rounded-full text-info hover:bg-info/10"
        >
          <InfoIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      {!hasSets && (
        <p className="px-4 py-3 text-neutral text-sm">Aucune série réalisée</p>
      )}

      {hasSets && (
        <table className="w-full text-sm tabular-nums">
          <caption className="sr-only">
            Séries réalisées pour {exercise.name}
          </caption>
          <tbody>
            {exercise.sets.map((set) => (
              <tr
                key={set.setNumber}
                className="border-base-300 border-t first:border-t-0"
              >
                <td className="w-12 py-2.5 pl-4 text-neutral">
                  {set.setNumber}
                </td>
                <td className="py-2.5 font-semibold">
                  {formatReps(set.repetitions)}
                </td>
                <td className="py-2.5 pr-4 font-semibold">
                  {formatWeight(set.weightKg)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}

export default CompletedExerciseBlock;
