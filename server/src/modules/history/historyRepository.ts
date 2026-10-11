import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";

class HistoryRepository {
  async readAllCompleted(userId: number) {
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
  }
}

export default new HistoryRepository();
