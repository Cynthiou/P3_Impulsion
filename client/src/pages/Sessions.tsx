import { useContext } from "react";
import CurrentSessionCard from "../components/workout-session/CurrentSessionCard";
import PreparedSessionsList from "../components/workout-session/PreparedSessionsList";
import { CurrentSessionContext } from "../contexts/CurrentSessionContext";
import usePreparedSessions from "../hooks/workout-session/usePreparedSessions";

function Sessions() {
  const { sessions, loading, error } = usePreparedSessions();
  const context = useContext(CurrentSessionContext);

  if (context === null) {
    throw new Error("Le contexte de la séance en cours est indisponible");
  }

  const currentSession = context.currentSession;

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl md:py-4">
      <h1 className="font-display font-extrabold text-2xl uppercase italic">
        Mes séances
      </h1>

      {currentSession && <CurrentSessionCard session={currentSession} />}

      <PreparedSessionsList sessions={sessions} />
    </div>
  );
}

export default Sessions;
