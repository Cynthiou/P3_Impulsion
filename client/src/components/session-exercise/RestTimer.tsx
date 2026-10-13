import { useState } from "react";
import XIcon from "../../assets/icons/actions/x.svg?react";
import ChevronUpIcon from "../../assets/icons/chevrons/chevron-up.svg?react";
import { formatClock } from "../../utils/formatClock";
import { getReadyStyles, restStyles } from "./restTimerStyles";

type RestTimerProps = {
  secondsLeft: number;
  progressBarTotal: number;
  onAddThirtySeconds: () => void;
  onRemoveThirtySeconds: () => void;
  onSkip: () => void;
};

const RestTimer = ({
  secondsLeft,
  progressBarTotal,
  onAddThirtySeconds,
  onRemoveThirtySeconds,
  onSkip,
}: RestTimerProps) => {
  const [isSmallWindow, setIsSmallWindow] = useState(false);

  if (secondsLeft === 0) {
    return null;
  }

  const timerText = formatClock(secondsLeft);

  let progressBarPercent = Math.ceil((secondsLeft / progressBarTotal) * 100);

  if (progressBarPercent > 100) {
    progressBarPercent = 100;
  }

  let styles = restStyles;

  if (secondsLeft <= 10) {
    styles = getReadyStyles;
  }

  if (isSmallWindow) {
    return (
      <button
        type="button"
        onClick={() => setIsSmallWindow(false)}
        aria-label={`Temps restant ${timerText}, afficher le minuteur`}
        className={`fixed right-0 bottom-0 left-0 z-40 flex h-20 items-center justify-between overflow-hidden border-t px-5 shadow-lg transition-colors lg:right-4 lg:bottom-4 lg:left-auto lg:w-80 lg:rounded-box lg:border ${styles.windowColorClassName}`}
      >
        <span
          className={`font-semibold text-xs uppercase tracking-widest ${styles.textColorClassName}`}
        >
          {styles.smallTitle}
        </span>

        <span className="flex items-center gap-3 text-white">
          <span
            className={`font-display font-extrabold text-3xl italic ${styles.timerAnimationClassName}`}
          >
            {timerText}
          </span>
          <ChevronUpIcon aria-hidden="true" className="size-5" />
        </span>

        <span
          className={`absolute bottom-0 left-0 h-1 transition-[width] duration-1000 ease-linear ${styles.progressColorClassName}`}
          style={{ width: `${progressBarPercent}%` }}
        />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-base-100/70 p-4">
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-box border text-center shadow-lg transition-colors ${styles.windowColorClassName}`}
      >
        <button
          type="button"
          onClick={() => setIsSmallWindow(true)}
          aria-label="Réduire le minuteur"
          className={`absolute top-4 right-4 flex size-10 items-center justify-center rounded-field text-white transition-colors ${styles.closeButtonClassName}`}
        >
          <XIcon aria-hidden="true" className="size-5" />
        </button>

        <div className="px-6 pt-10 pb-6">
          <p
            className={`font-semibold text-xs uppercase tracking-widest ${styles.textColorClassName}`}
          >
            {styles.bigTitle}
          </p>
          <p
            className={`mt-2 font-display font-extrabold text-7xl italic ${styles.textColorClassName} ${styles.timerAnimationClassName}`}
          >
            {timerText}
          </p>
        </div>

        <div className={`h-1 w-full ${styles.progressTrackClassName}`}>
          <div
            className={`h-1 transition-[width] duration-1000 ease-linear ${styles.progressColorClassName}`}
            style={{ width: `${progressBarPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          <div
            className={`flex items-center justify-between rounded-field ${styles.stepperColorClassName}`}
          >
            <button
              type="button"
              onClick={onRemoveThirtySeconds}
              aria-label="Retirer 30 secondes"
              className={`rounded-l-field px-4 py-3 font-semibold text-lg transition-colors ${styles.stepperHoverClassName}`}
            >
              −
            </button>
            <span className="font-semibold text-sm">30 s</span>
            <button
              type="button"
              onClick={onAddThirtySeconds}
              aria-label="Ajouter 30 secondes"
              className={`rounded-r-field px-4 py-3 font-semibold text-lg transition-colors ${styles.stepperHoverClassName}`}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className={`rounded-field py-3 font-semibold text-sm transition ${styles.skipButtonClassName}`}
          >
            Passer le repos
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
