import { useNavigate } from "react-router";
import RestTimeSelector from "../components/session-exercise/RestTimeSelector";
import useWorkoutTemplates from "../hooks/workout-template/useWorkoutTemplates";

function Programs() {
  const navigate = useNavigate();
  const {
    templates,
    loading,
    error,
    updatingExerciseId,
    preparingTemplateId,
    updateExerciseRest,
    prepareSession,
  } = useWorkoutTemplates();

  const handlePrepareSession = async (templateId: number) => {
    const sessionId = await prepareSession(templateId);

    if (sessionId !== null) {
      navigate(`/sessions/${sessionId}`);
    }
  };

  if (loading) {
    return <p>Chargement des séances types...</p>;
  }

  return (
    <div className="w-full max-w-4xl pb-24 md:py-4">
      <h1 className="font-display font-extrabold text-3xl uppercase italic lg:text-4xl">
        Programmes
      </h1>
      <p className="mt-2 max-w-2xl text-base-content/70">
        Réglez le repos prévu pour chaque exercice avant de préparer votre
        séance.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-error/40 bg-error/10 px-4 py-3 text-error text-sm"
        >
          {error}
        </p>
      )}

      {error === null && templates.length === 0 ? (
        <div className="mt-8 rounded-box border border-base-300 border-dashed px-6 py-10 text-center">
          <h2 className="font-display font-bold text-xl uppercase italic">
            Aucun programme pour le moment
          </h2>
          <p className="mt-2 text-base-content/70 text-sm">
            Vos futures séances types apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {templates.map((template) => (
            <article
              key={template.id}
              className="rounded-box border border-base-300 bg-base-200 p-5 shadow-sm"
            >
              <p className="font-semibold text-primary text-xs uppercase tracking-widest">
                {template.programName}
              </p>
              <div className="mt-1 flex items-start justify-between gap-4">
                <h2 className="font-display font-extrabold text-2xl uppercase italic">
                  {template.name}
                </h2>
                {template.estimatedDurationMinutes !== null && (
                  <span className="shrink-0 rounded-full bg-base-300 px-3 py-1 text-xs">
                    {template.estimatedDurationMinutes} min
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {template.exercises.length === 0 ? (
                  <p className="text-base-content/60 text-sm">
                    Cette séance type ne contient aucun exercice.
                  </p>
                ) : (
                  template.exercises.map((exercise) => (
                    <div
                      key={exercise.templateExerciseId}
                      className="rounded-xl border border-base-300 bg-base-100 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary/20 font-display font-bold text-secondary italic">
                          {exercise.position}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {exercise.name}
                          </h3>
                          <p className="text-base-content/60 text-sm">
                            {exercise.category}
                          </p>
                        </div>
                      </div>
                      <RestTimeSelector
                        value={exercise.restSeconds}
                        onChange={(restSeconds) =>
                          updateExerciseRest(
                            template.id,
                            exercise.templateExerciseId,
                            restSeconds,
                          )
                        }
                        disabled={updatingExerciseId !== null}
                      />
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => handlePrepareSession(template.id)}
                disabled={
                  template.exercises.length === 0 ||
                  updatingExerciseId !== null ||
                  preparingTemplateId === template.id
                }
                className="mt-5 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-content transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-base-300 disabled:text-base-content/40"
              >
                {preparingTemplateId === template.id
                  ? "Préparation..."
                  : "Préparer cette séance"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Programs;
