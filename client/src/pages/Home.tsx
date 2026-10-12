import { useContext } from "react";
import { useNavigate } from "react-router";
import HomeActionButton from "../components/home/HomeActionButton";
import PreparedSessionsList from "../components/workout-session/PreparedSessionsList";
import { CurrentSessionContext } from "../contexts/CurrentSessionContext";
import useCreatePreparedSession from "../hooks/workout-session/useCreatePreparedSession";
import usePreparedSessions from "../hooks/workout-session/usePreparedSessions";

const Home = () => {
  const { sessions, loading, error } = usePreparedSessions();
  const { createPreparedSession, loading: createLoading } =
    useCreatePreparedSession();
  const currentSessionContext = useContext(CurrentSessionContext);
  const navigate = useNavigate();

  if (currentSessionContext === null) {
    throw new Error("Le contexte de la séance en cours est indisponible");
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const currentSession = currentSessionContext.currentSession;
  const draftSession = sessions.find((session) => session.exerciseCount === 0);

  const handleSessionAction = async () => {
    if (currentSession !== null) {
      navigate(`/sessions/${currentSession.id}`);
      return;
    }

    const sessionId = await createPreparedSession();

    if (sessionId !== null) {
      navigate(`/sessions/${sessionId}`);
    }
  };

  return (
    <div className="w-full max-w-2xl md:py-4 lg:px-4">
      <section>
        <h1 className="font-display font-extrabold text-4xl uppercase italic leading-none md:text-5xl">
          <span className="block lg:inline">Prêt pour</span>{" "}
          <span className="text-info">ta séance</span> ?
        </h1>

        <HomeActionButton
          currentSession={currentSession}
          hasDraft={draftSession !== undefined}
          onAction={handleSessionAction}
          isLoading={createLoading}
        />
      </section>

      <section>
        <PreparedSessionsList sessions={sessions} limit={3} />
      </section>
    </div>
  );
};

export default Home;
