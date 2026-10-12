import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import ChevronLeftIcon from "../assets/icons/chevrons/chevron-left.svg?react";
import AlertCircleIcon from "../assets/icons/etats/alert-circle.svg?react";
import InfoCircleIcon from "../assets/icons/etats/info-circle.svg?react";
import { useMessages } from "../contexts/MessageContext";
import useCompleteSession from "../hooks/workout-session/useCompleteSession";
import useSessionSummary from "../hooks/workout-session/useSessionSummary";
import { calculateTotalVolume } from "../utils/calculateTotalVolume";
import { formatDuration } from "../utils/formatDuration";
import { formatSessionDateLong } from "../utils/formatSessionDate";
import { formatWeight } from "../utils/formatWeight";

function SessionSummary() {
  const { id } = useParams();

  const sessionId = Number(id);
  const { summary, loading, error } = useSessionSummary(sessionId);

  const [showChronoInfo, setShowChronoInfo] = useState(true);

  const navigate = useNavigate();
  const { showMessage } = useMessages();
  const { completeSession, loading: completeLoading } = useCompleteSession();

  const handleComplete = async () => {
    const isCompleted = await completeSession(sessionId);

    if (isCompleted) {
      showMessage("Bravo, séance enregistrée", "success");
      navigate("/");
    } else {
      showMessage("Impossible de valider la séance", "error");
    }
  };

  if (loading) {
    return (
      <p className="text-base-content/75">Chargement du récapitulatif...</p>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto flex min-h-[calc(100dvh-14rem)] w-full max-w-xl flex-col items-center justify-center gap-4 rounded-box border border-error/35 bg-[color-mix(in_oklab,var(--color-error)_10%,var(--color-base-100))] px-6 py-10 text-center"
      >
        <AlertCircleIcon
          aria-hidden="true"
          className="size-12 shrink-0 text-error"
        />
        <p className="text-balance font-display font-extrabold text-lg text-error uppercase italic leading-tight">
          {error}
        </p>
      </div>
    );
  }

  if (!summary) {
    return <p className="text-base-content/75">Récapitulatif introuvable.</p>;
  }

  let buttonText = "Terminer et enregistrer";

  if (completeLoading) {
    buttonText = "Enregistrement...";
  }

  const totalVolumeKg = calculateTotalVolume(summary.sets);
  const volumeText = formatWeight(totalVolumeKg);

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-xl flex-col gap-6 pb-24">
      <div className="flex items-start gap-1">
        <Link
          to={`/sessions/${id}`}
          aria-label="Retour à la séance"
          className="-ml-2 grid size-10 shrink-0 place-items-center rounded-full text-base-content transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-6" />
        </Link>

        <h1 className="whitespace-nowrap py-0.5 font-display font-extrabold text-2xl uppercase italic leading-snug lg:text-4xl">
          Récapitulatif
        </h1>
      </div>

      {showChronoInfo && (
        <p className="relative flex items-start gap-3 rounded-box border border-info/50 bg-[color-mix(in_oklab,var(--color-info)_16%,var(--color-base-100))] py-3 pr-12 pl-4 text-info text-sm leading-5">
          <InfoCircleIcon
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
          />
          Le chrono continue pendant que tu consultes ce récapitulatif.
          <button
            type="button"
            aria-label="Fermer le message"
            onClick={() => setShowChronoInfo(false)}
            className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-xl leading-none transition-colors hover:bg-info/20 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </p>
      )}

      <dl className="divide-y divide-base-300 overflow-hidden rounded-box border border-base-300 bg-base-200">
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <dt className="text-base-content/75 text-sm">Date</dt>
          <dd className="font-semibold capitalize">
            {formatSessionDateLong(summary.date)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <dt className="text-base-content/75 text-sm">Durée</dt>
          <dd className="font-semibold tabular-nums">
            {formatDuration(summary.durationSeconds)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <dt className="text-base-content/75 text-sm">Exercices</dt>
          <dd className="font-semibold tabular-nums">
            {summary.exerciseCount}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
          <dt className="text-base-content/75 text-sm">Séries faites</dt>
          <dd className="font-semibold tabular-nums">
            {summary.completedSetCount}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 bg-base-300/40 px-4 py-4">
          <dt className="font-semibold text-accent text-xs uppercase tracking-widest">
            Volume total
          </dt>
          <dd className="font-display font-extrabold text-2xl italic tabular-nums">
            {volumeText}
          </dd>
        </div>
      </dl>

      <div className="mt-auto space-y-3">
        <Link
          to={`/sessions/${id}`}
          className="flex w-full items-center justify-center rounded-lg border border-base-content/40 bg-base-100 px-5 py-3 text-center font-semibold text-sm transition-colors duration-200 hover:border-info hover:bg-info/10 hover:text-info focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2"
        >
          Continuer la séance
        </Link>

        <button
          type="button"
          onClick={handleComplete}
          disabled={completeLoading}
          className="flex w-full items-center justify-center rounded-lg border border-primary bg-primary px-5 py-3 text-center font-semibold text-primary-content text-sm transition-colors duration-200 hover:border-info hover:bg-info hover:text-white focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-wait disabled:border-base-300 disabled:bg-base-200 disabled:text-base-content/35 disabled:hover:border-base-300 disabled:hover:bg-base-200 disabled:hover:text-base-content/35"
        >
          {buttonText}
        </button>
      </div>
    </main>
  );
}

export default SessionSummary;
