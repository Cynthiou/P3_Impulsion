import { useState } from "react";
import { formatClock } from "../../utils/formatClock";

type RestTimerProps = {
  secondsLeft: number;
  onAddThirtySeconds: () => void;
  onRemoveThirtySeconds: () => void;
  onSkip: () => void;
};

const RestTimer = ({
  secondsLeft,
  onAddThirtySeconds,
  onRemoveThirtySeconds,
  onSkip,
}: RestTimerProps) => {
  const [isSmallWindow, setIsSmallWindow] = useState(false);

  if (secondsLeft === 0) {
    return null;
  }

  const timerText = formatClock(secondsLeft);

  let timerColorClassName = "text-info";

  if (secondsLeft <= 5) {
    timerColorClassName = "text-primary";
  }

  if (isSmallWindow) {
    return (
      <div className="fixed right-0 bottom-0 left-0 z-40 flex h-20 items-center gap-3 border-info border-t-2 bg-base-300 px-4 shadow-lg lg:right-4 lg:bottom-4 lg:left-auto lg:w-80 lg:rounded-box lg:border-2">
        <p
          className={`font-display font-extrabold text-2xl italic ${timerColorClassName}`}
        >
          {timerText}
        </p>
        <p className="flex-1 font-semibold text-base-content text-sm">Repos</p>
        <button
          type="button"
          onClick={() => setIsSmallWindow(false)}
          className="font-semibold text-info text-sm"
        >
          Afficher ↑
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-base-100/70 p-4">
      <div className="w-full max-w-sm rounded-box border border-base-300 bg-base-200 text-center shadow-lg">
        <div className="px-6 pt-6 pb-5">
          <p className="font-semibold text-base-content/60 text-xs uppercase tracking-widest">
            Temps de repos
          </p>
          <p
            className={`mt-2 font-display font-extrabold text-7xl italic ${timerColorClassName}`}
          >
            {timerText}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-base-300 border-t p-4">
          <div className="flex items-center justify-between rounded-field border border-base-content/30">
            <button
              type="button"
              onClick={onRemoveThirtySeconds}
              aria-label="Retirer 30 secondes"
              className="rounded-l-field px-4 py-3 font-semibold text-lg transition-colors hover:bg-info/10 hover:text-info"
            >
              −
            </button>
            <span className="font-semibold text-sm">30 s</span>
            <button
              type="button"
              onClick={onAddThirtySeconds}
              aria-label="Ajouter 30 secondes"
              className="rounded-r-field px-4 py-3 font-semibold text-lg transition-colors hover:bg-info/10 hover:text-info"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-field bg-primary py-3 font-semibold text-primary-content text-sm transition-colors hover:bg-info hover:text-white"
          >
            Passer le repos
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsSmallWindow(true)}
          className="w-full border-base-300 border-t py-3 font-semibold text-info text-sm transition-colors hover:bg-base-300/50"
        >
          Réduire · modifier ma séance
        </button>
      </div>
    </div>
  );
};

export default RestTimer;
