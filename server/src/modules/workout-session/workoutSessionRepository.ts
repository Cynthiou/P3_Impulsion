import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

class WorkoutSessionRepository {
  async createSession(userId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO workout_session (user_id, status) 
        VALUES (?, 'prepared')`,
      [userId],
    );

    return result.insertId;
  }

  async readSession(sessionId: number, userId: number) {
    const [rows] = await databaseClient.query<Rows>(
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

    return rows[0];
  }

  async readPreparedSessions(userId: number) {
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

  async readCurrentSession(userId: number) {
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

  async readSessionSummary(sessionId: number, userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        status,
        started_at AS date,
        LEAST(TIMESTAMPDIFF(SECOND, started_at, NOW()), 6 * 60 * 60) AS durationSeconds,
        (SELECT COUNT(*)
         FROM workout_session_exercise
         WHERE workout_session_exercise.workout_session_id = workout_session.id
        ) AS exerciseCount
       FROM workout_session
       WHERE id = ?
         AND user_id = ?`,
      [sessionId, userId],
    );

    return rows[0];
  }

  async readCompletedSets(sessionId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT exercise_set.repetitions, exercise_set.weight_kg AS weightKg
       FROM exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       WHERE workout_session_exercise.workout_session_id = ?
         AND exercise_set.is_completed = TRUE`,
      [sessionId],
    );

    return rows;
  }

  async startSession(sessionId: number, userId: number) {
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

  async abandonSession(sessionId: number, userId: number) {
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

  async completeSession(sessionId: number, userId: number) {
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

  async deleteSession(sessionId: number, userId: number) {
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
