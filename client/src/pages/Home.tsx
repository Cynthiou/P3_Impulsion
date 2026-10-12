import { useContext } from "react";
import { useNavigate } from "react-router";
import HomeActionButton from "../components/home/HomeActionButton";
import LastSession from "../components/home/LastSession";
import PreparedSessionsList from "../components/workout-session/PreparedSessionsList";
import { useAuth } from "../contexts/AuthContext";
import { CurrentSessionContext } from "../contexts/CurrentSessionContext";
import useCreatePreparedSession from "../hooks/workout-session/useCreatePreparedSession";
import usePreparedSessions from "../hooks/workout-session/usePreparedSessions";

const Home = () => {
  const { sessions, loading, error } = usePreparedSessions();
  const { createPreparedSession, loading: createLoading } =
    useCreatePreparedSession();
  const currentSessionContext = useContext(CurrentSessionContext);
  const { user } = useAuth();
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

  let helloText = "Bonjour";

  if (user !== null) {
    helloText = `Bonjour ${user.username}`;
  }

  const currentSession = currentSessionContext.currentSession;
  const draftSession = sessions.find((session) => session.exerciseCount === 0);
  const hasDraft = draftSession !== undefined;

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
        <p className="mb-4 font-semibold text-accent text-xs uppercase tracking-widest">
          {helloText}
        </p>

        <h1 className="font-display font-extrabold text-4xl uppercase italic leading-none md:text-5xl">
          <span className="block lg:inline">Prêt pour</span>{" "}
          <span className="text-info">ta séance</span> ?
        </h1>

        <HomeActionButton
          currentSession={currentSession}
          hasDraft={hasDraft}
          onAction={handleSessionAction}
          isLoading={createLoading}
        />
      </section>

      <section>
        <PreparedSessionsList sessions={sessions} limit={3} />
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-accent text-xs uppercase tracking-widest">
          Progression
        </h2>

        <div className="mt-3 rounded-box border border-base-300 border-dashed p-4 text-base-content/75 text-sm leading-6">
          <p className="max-w-md">
            Ta courbe apparaîtra après deux séances contenant le même exercice.
          </p>
        </div>
      </section>

      <LastSession />
    </div>
  );
};

export default Home;
