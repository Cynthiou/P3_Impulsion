import { useNavigate, useParams } from "react-router";
import { useMessages } from "../contexts/MessageContext";
import useAddExercisesToSession from "../hooks/session-exercise/useAddExercisesToSession";
import useWorkoutSession from "../hooks/workout-session/useWorkoutSession";
import Exercises from "./Exercises";

function AddExercisesToSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showMessage } = useMessages();
  const {
    addExercisesToSession,
    loading: addLoading,
    error: addError,
  } = useAddExercisesToSession();

  const sessionId = Number(id);
  const isValidSessionId = Number.isInteger(sessionId) && sessionId > 0;
  const {
    session,
    loading: sessionLoading,
    error: sessionError,
  } = useWorkoutSession(sessionId);

  async function handleValidate(selectedIds: number[]) {
    if (!isValidSessionId || addLoading) {
      return;
    }

    const exercisesAdded = await addExercisesToSession(sessionId, selectedIds);

    if (!exercisesAdded) {
      return;
    }

    showMessage("Exercices ajoutés à la séance", "success");
    navigate(`/sessions/${sessionId}`);
  }

  if (!isValidSessionId) {
    return <p>Identifiant de séance invalide.</p>;
  }

  if (sessionLoading) {
    return <p>Chargement de la séance...</p>;
  }

  if (sessionError || session === null) {
    return <p>Impossible de charger la séance.</p>;
  }

  const existingExerciseIds =
    session.exercises?.map((exercise) => exercise.id) ?? [];

  return (
    <>
      {addError && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-error"
        >
          {addError}
        </p>
      )}

      <Exercises
        selectionMode
        excludedIds={existingExerciseIds}
        onCancel={() => navigate(`/sessions/${sessionId}`)}
        onValidate={handleValidate}
      />
    </>
  );
}

export default AddExercisesToSession;
