import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import sessionExerciseRepository from "../session-exercise/sessionExerciseRepository";

class WorkoutSessionRepository {
  async create(userId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO workout_session (user_id, status) 
        VALUES (?, 'prepared')`,
      [userId],
    );
    return result.insertId;
  }

  async readAllPrepared(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        user_id AS userId,
        created_at AS createdAt,
        started_at AS startedAt,
        ended_at AS endedAt,
        status,
        (SELECT COUNT(*)
         FROM workout_session_exercise
         WHERE workout_session_exercise.workout_session_id = workout_session.id
        ) AS exerciseCount
       FROM workout_session
       WHERE user_id = ?
         AND status = 'prepared'
       ORDER BY created_at DESC`,
      [userId],
    );

    return rows;
  }

  async read(sessionId: number, userId: number) {
    const [sessionRows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        user_id AS userId,
        created_at AS createdAt,
        started_at AS startedAt,
        ended_at AS endedAt,
        status
       FROM workout_session
       WHERE id = ?
         AND user_id = ?`,
      [sessionId, userId],
    );

    const session = sessionRows[0];

    if (session === undefined) {
      return undefined;
    }

    const [exerciseRows] = await databaseClient.query<Rows>(
      `SELECT
        workout_session_exercise.id AS sessionExerciseId,
        exercise.id,
        exercise.slug,
        exercise.name,
        category.name AS category,
        workout_session_exercise.position,
        workout_session_exercise.target_sets AS targetSets,
        workout_session_exercise.target_reps AS targetReps,
        workout_session_exercise.target_weight_kg AS targetWeightKg,
        workout_session_exercise.target_duration_seconds AS targetDurationSeconds,
        workout_session_exercise.rest_seconds AS restSeconds
       FROM workout_session_exercise
       JOIN exercise
         ON exercise.id = workout_session_exercise.exercise_id
       JOIN category
         ON category.id = exercise.category_id
       WHERE workout_session_exercise.workout_session_id = ?
       ORDER BY workout_session_exercise.position`,
      [sessionId],
    );

    const completedSetCount =
      await sessionExerciseRepository.countCompletedSets(sessionId);

    return {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      status: session.status,
      exerciseCount: exerciseRows.length,
      completedSetCount: completedSetCount,
      exercises: exerciseRows,
    };
  }

  async readCurrent(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        user_id AS userId,
        created_at AS createdAt,
        started_at AS startedAt,
        ended_at AS endedAt,
        status,
        (SELECT COUNT(*)
         FROM workout_session_exercise
         WHERE workout_session_exercise.workout_session_id = workout_session.id
        ) AS exerciseCount
       FROM workout_session
       WHERE user_id = ?
         AND status = 'in_progress'
       LIMIT 1`,
      [userId],
    );

    return rows[0];
  }

  async start(sessionId: number, userId: number) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE workout_session
       SET status = 'in_progress',
           started_at = NOW()
       WHERE id = ?
         AND user_id = ?
         AND status = 'prepared'`,
      [sessionId, userId],
    );

    return result.affectedRows;
  }

  async abandon(sessionId: number, userId: number) {
    const completedSetCount =
      await sessionExerciseRepository.countCompletedSets(sessionId);

    if (completedSetCount > 0) {
      return 0;
    }

    const [result] = await databaseClient.query<Result>(
      `UPDATE workout_session
       SET status = 'prepared',
           started_at = NULL,
           ended_at = NULL
       WHERE id = ?
         AND user_id = ?
         AND status = 'in_progress'`,
      [sessionId, userId],
    );

    return result.affectedRows;
  }

  async readSummary(sessionId: number, userId: number) {
    const [sessionRows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        status,
        started_at AS date,
        LEAST(TIMESTAMPDIFF(SECOND, started_at, NOW()), 6 * 60 * 60) AS durationSeconds
       FROM workout_session
       WHERE id = ?
         AND user_id = ?`,
      [sessionId, userId],
    );

    const session = sessionRows[0];

    if (session === undefined) {
      return undefined;
    }
    const [exerciseRows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS exerciseCount
       FROM workout_session_exercise
       WHERE workout_session_id = ?`,
      [sessionId],
    );
    const [setRows] = await databaseClient.query<Rows>(
      `SELECT exercise_set.repetitions, exercise_set.weight_kg AS weightKg
       FROM exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       WHERE workout_session_exercise.workout_session_id = ?
         AND exercise_set.is_completed = TRUE`,
      [sessionId],
    );

    return {
      id: session.id,
      status: session.status,
      date: session.date,
      durationSeconds: Number(session.durationSeconds),
      exerciseCount: Number(exerciseRows[0].exerciseCount),
      completedSetCount: setRows.length,
      sets: setRows,
    };
  }

  async complete(sessionId: number, userId: number) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE workout_session
       SET status = 'completed',
           ended_at = LEAST(NOW(), started_at + INTERVAL 6 HOUR)
       WHERE id = ?
         AND user_id = ?
         AND status = 'in_progress'`,
      [sessionId, userId],
    );

    return result.affectedRows;
  }

  async delete(sessionId: number, userId: number) {
    const [result] = await databaseClient.query<Result>(
      `DELETE FROM workout_session
        WHERE id = ?
        AND user_id = ?
        AND status = 'prepared'`,
      [sessionId, userId],
    );
    return result.affectedRows;
  }
}

export default new WorkoutSessionRepository();
