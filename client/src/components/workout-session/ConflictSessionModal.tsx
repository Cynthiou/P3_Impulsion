type ConflictSessionModalProps = {
  isAbandoning: boolean;
  onClose: () => void;
  onResume: () => void;
  onAbandon: () => void;
};

const ConflictSessionModal = ({
  isAbandoning,
  onClose,
  onResume,
  onAbandon,
}: ConflictSessionModalProps) => {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-base-100/60 p-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-box border border-base-300 bg-base-200 p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Fermer la fenêtre"
          onClick={onClose}
          disabled={isAbandoning}
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-2xl leading-none transition-colors hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-40"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <h2 className="text-balance pr-10 font-display font-extrabold text-xl uppercase italic">
          Séance déjà en cours
        </h2>

        <p className="mt-2 text-base-content/75">
          Vous avez déjà une séance en cours.
        </p>

        <button
          type="button"
          onClick={onResume}
          disabled={isAbandoning}
          className="mt-5 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-content disabled:cursor-wait disabled:opacity-60"
        >
          Reprendre la séance
        </button>

        <button
          type="button"
          onClick={onAbandon}
          disabled={isAbandoning}
          className="mt-3 w-full rounded-lg border border-base-content/40 px-4 py-3 font-semibold transition-colors hover:border-base-content hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {isAbandoning ? "Abandon en cours..." : "Abandonner la séance"}
        </button>
      </div>
    </div>
  );
};

export default ConflictSessionModal;
