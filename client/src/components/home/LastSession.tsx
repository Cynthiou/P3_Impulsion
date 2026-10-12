import useHistorySessions from "../../hooks/history/useHistorySessions";
import CompletedSessionCard from "../history/CompletedSessionCard";

const LastSession = () => {
  const { sessions, loading, error } = useHistorySessions();

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="mt-6">
      <h2 className="font-semibold text-accent text-xs uppercase tracking-widest">
        Dernière séance
      </h2>

      {sessions.length === 0 && (
        <div className="mt-3 rounded-box border border-base-300 border-dashed p-4 text-base-content/75 text-sm leading-6">
          <p className="max-w-md">
            Aucune séance enregistrée. Ta première séance apparaîtra ici une
            fois validée.
          </p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="mt-3">
          <CompletedSessionCard session={sessions[0]} />
        </div>
      )}
    </section>
  );
};

export default LastSession;
