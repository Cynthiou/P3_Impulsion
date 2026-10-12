import { useState } from "react";
import { Link } from "react-router";

import ChevronLeftIcon from "../../assets/icons/chevrons/chevron-left.svg?react";
import useWorkoutSessionDetail from "../../hooks/history/useWorkoutSessionDetail";
import { calculateTotalVolume } from "../../utils/calculateTotalVolume";
import { formatDuration } from "../../utils/formatDuration";
import { formatFullDate } from "../../utils/formatSessionDate";
import { groupSetsByExercise } from "../../utils/groupSetsByExercise";
import ExerciseDetailSheet from "../exercise/ExerciseDetailSheet";
import CompletedExerciseBlock from "./CompletedExerciseBlock";

type CompletedSessionViewProps = {
  sessionId: number;
};

function CompletedSessionView({ sessionId }: CompletedSessionViewProps) {
  const { session, loading, error } = useWorkoutSessionDetail(sessionId);

  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!session) {
    return <p>Séance introuvable.</p>;
  }

  const dateText = formatFullDate(session.startedAt);
  const durationText = formatDuration(session.durationSeconds);
  const exerciseCount = session.exerciseCount;
  const totalVolumeKg = calculateTotalVolume(session.sets);
  const volumeText = `${totalVolumeKg.toLocaleString("fr-FR")} kg`;
  const exercisesWithSets = groupSetsByExercise(
    session.exercises,
    session.sets,
  );

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 pb-24">
      <div className="flex items-start gap-1">
        <Link
          to="/history"
          aria-label="Retour à l'historique"
          className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-base-content transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-6" />
        </Link>

        <h1 className="py-0.5 font-display font-extrabold text-2xl uppercase italic leading-snug lg:text-4xl">
          {dateText}
        </h1>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <div className="flex flex-col-reverse items-center gap-0.5 rounded-box border border-base-300 bg-base-200 px-3 py-1.5 text-center">
          <dt className="text-base-content/75 text-xs uppercase tracking-widest">
            Durée
          </dt>
          <dd className="font-display font-extrabold text-lg italic tabular-nums">
            {durationText}
          </dd>
        </div>
        <div className="flex flex-col-reverse items-center gap-0.5 rounded-box border border-base-300 bg-base-200 px-3 py-1.5 text-center">
          <dt className="text-base-content/75 text-xs uppercase tracking-widest">
            Exercices
          </dt>
          <dd className="font-display font-extrabold text-lg italic tabular-nums">
            {exerciseCount}
          </dd>
        </div>
        <div className="flex flex-col-reverse items-center gap-0.5 rounded-box border border-base-300 bg-base-200 px-3 py-1.5 text-center">
          <dt className="text-base-content/75 text-xs uppercase tracking-widest">
            Volume
          </dt>
          <dd className="font-display font-extrabold text-lg italic tabular-nums">
            {volumeText}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-4">
        {exercisesWithSets.map((exercise) => (
          <CompletedExerciseBlock
            key={exercise.sessionExerciseId}
            exercise={exercise}
            onOpenDetail={setSelectedExerciseId}
          />
        ))}
      </div>

      <ExerciseDetailSheet
        exerciseId={selectedExerciseId}
        onClose={() => setSelectedExerciseId(null)}
      />
    </main>
  );
}

export default CompletedSessionView;
