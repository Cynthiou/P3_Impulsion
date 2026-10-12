import useAbandonSession from "../../hooks/workout-session/useAbandonSession";
import LocalErrorState from "../feedback/LocalErrorState";

type AbandonSessionModalProps = {
  sessionId: number;
  onClose: () => void;
  onAbandoned: () => void;
};

const AbandonSessionModal = ({
  sessionId,
  onClose,
  onAbandoned,
}: AbandonSessionModalProps) => {
  const { abandonSession, isAbandoning, error } = useAbandonSession();

  const handleAbandon = async () => {
    const abandoned = await abandonSession(sessionId);

    if (abandoned) {
      onAbandoned();
    }
  };

  let confirmLabel = "Abandonner";

  if (isAbandoning) {
    confirmLabel = "Abandon en cours...";
  }

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

        <h2 className="text-balance pr-10 font-display font-extrabold text-xl uppercase italic md:text-2xl">
          Abandonner cette séance ?
        </h2>

        <p className="mt-2 text-base-content/75 text-sm leading-6">
          La séance sera remise en préparation. Les exercices déjà ajoutés
          seront conservés.
        </p>

        {error !== null && (
          <div className="mt-5">
            <LocalErrorState message={error} />
          </div>
        )}

        <button
          type="button"
          onClick={handleAbandon}
          disabled={isAbandoning}
          className="mt-5 w-full rounded-lg bg-error px-4 py-3 font-semibold text-error-content transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-error focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          {confirmLabel}
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={isAbandoning}
          className="mt-3 w-full rounded-lg border border-base-content/40 px-4 py-3 font-semibold transition-colors hover:border-base-content hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-info focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60"
        >
          Continuer ma séance
        </button>
      </div>
    </div>
  );
};

export default AbandonSessionModal;
