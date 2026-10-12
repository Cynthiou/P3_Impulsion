import { useContext } from "react";
import { useParams } from "react-router";
import CompletedSessionDetail from "../components/history/CompletedSessionDetail";
import CurrentSessionDetail from "../components/workout-session/CurrentSessionDetail";
import PreparedSessionDetail from "../components/workout-session/PreparedSessionDetail";
import { CurrentSessionContext } from "../contexts/CurrentSessionContext";
import useWorkoutSession from "../hooks/workout-session/useWorkoutSession";

const SessionId = () => {
  const { id } = useParams();

  const sessionId = Number(id);
  const {
    session,
    loading,
    error,
    updateSessionExercises,
    changeCompletedSetCount,
  } = useWorkoutSession(sessionId);

  const currentSessionContext = useContext(CurrentSessionContext);

  if (currentSessionContext === null) {
    throw new Error("Le contexte de la séance en cours est indisponible");
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!session) {
    return <p>Séance introuvable.</p>;
  }

  if (session.status === "completed") {
    return <CompletedSessionDetail sessionId={session.id} />;
  }

  const currentSession = currentSessionContext.currentSession;

  const isCurrentSession =
    currentSession !== null && currentSession.id === session.id;

  const isInProgress = session.status === "in_progress" || isCurrentSession;

  let startedAt = session.startedAt;

  if (isCurrentSession) {
    startedAt = currentSession.startedAt;
  }

  if (isInProgress) {
    return (
      <CurrentSessionDetail
        session={session}
        startedAt={startedAt}
        updateSessionExercises={updateSessionExercises}
        onSetCompletionChange={changeCompletedSetCount}
      />
    );
  }

  return (
    <PreparedSessionDetail
      session={session}
      updateSessionExercises={updateSessionExercises}
    />
  );
};

export default SessionId;
