import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

const readCompletedSessions = async (userId: number) => {
  const [rows] = await databaseClient.query<Rows>(
    `SELECT
      id,
      started_at AS date,
      TIMESTAMPDIFF(SECOND, started_at, ended_at) AS durationSeconds,
      (SELECT COUNT(*)
       FROM workout_session_exercise
       WHERE workout_session_exercise.workout_session_id = workout_session.id
      ) AS exerciseCount
     FROM workout_session
     WHERE user_id = ?
       AND status = 'completed'
     ORDER BY started_at DESC`,
    [userId],
  );

  return rows;
};

const readCompletedSession = async (sessionId: number, userId: number) => {
  const [rows] = await databaseClient.query<Rows>(
    `SELECT
      id,
      started_at AS startedAt,
      TIMESTAMPDIFF(SECOND, started_at, ended_at) AS durationSeconds,
      (SELECT COUNT(*)
       FROM workout_session_exercise
       WHERE workout_session_exercise.workout_session_id = workout_session.id
      ) AS exerciseCount
     FROM workout_session
     WHERE id = ?
       AND user_id = ?
       AND status = 'completed'`,
    [sessionId, userId],
  );

  return rows[0];
};

const readSessionExercises = async (sessionId: number) => {
  const [rows] = await databaseClient.query<Rows>(
    `SELECT
      workout_session_exercise.id AS sessionExerciseId,
      exercise.id,
      exercise.name,
      workout_session_exercise.position
     FROM workout_session_exercise
     JOIN exercise
       ON exercise.id = workout_session_exercise.exercise_id
     WHERE workout_session_exercise.workout_session_id = ?
     ORDER BY workout_session_exercise.position`,
    [sessionId],
  );

  return rows;
};

const readSessionCompletedSets = async (sessionId: number) => {
  const [rows] = await databaseClient.query<Rows>(
    `SELECT
      exercise_set.workout_session_exercise_id AS sessionExerciseId,
      exercise_set.set_number AS setNumber,
      exercise_set.repetitions,
      exercise_set.weight_kg AS weightKg,
      exercise_set.duration_seconds AS durationSeconds
     FROM exercise_set
     JOIN workout_session_exercise
       ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
     WHERE workout_session_exercise.workout_session_id = ?
       AND exercise_set.is_completed = TRUE
     ORDER BY exercise_set.set_number`,
    [sessionId],
  );

  return rows;
};

export default {
  readCompletedSessions,
  readCompletedSession,
  readSessionExercises,
  readSessionCompletedSets,
};
