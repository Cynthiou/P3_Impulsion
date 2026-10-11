import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import { DEFAULT_REST_SECONDS } from "../../helpers/restTime";

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
        workout_session.id,
        workout_session.user_id AS userId,
        workout_session.created_at AS createdAt,
        workout_session.started_at AS startedAt,
        workout_session.ended_at AS endedAt,
        workout_session.status,
        COUNT(workout_session_exercise.id) AS exerciseCount
      FROM workout_session
      LEFT JOIN workout_session_exercise
        ON workout_session.id = workout_session_exercise.workout_session_id
      WHERE workout_session.user_id = ?
        AND workout_session.status = 'prepared'
      GROUP BY workout_session.id
      ORDER BY workout_session.created_at DESC`,
      [userId],
    );

    return rows;
  }

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

    const [setRows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS completedSetCount
       FROM exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       WHERE workout_session_exercise.workout_session_id = ?
         AND exercise_set.is_completed = TRUE`,
      [sessionId],
    );

    return {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      status: session.status,
      exerciseCount: exerciseRows.length,
      completedSetCount: Number(setRows[0].completedSetCount),
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

  async addExercises(
    sessionId: number,
    userId: number,
    exerciseIds: number[],
  ): Promise<
    | "created"
    | "session_not_found"
    | "session_not_prepared"
    | "exercise_not_found"
    | "duplicate_exercise"
  > {
    const [sessionRows] = await databaseClient.query<Rows>(
      `SELECT status
       FROM workout_session
       WHERE id = ?
         AND user_id = ?`,
      [sessionId, userId],
    );

    const session = sessionRows[0];

    if (session === undefined) {
      return "session_not_found";
    }

    if (session.status !== "prepared" && session.status !== "in_progress") {
      return "session_not_prepared";
    }

    const placeholders = exerciseIds.map(() => "?").join(", ");

    const [exerciseRows] = await databaseClient.query<Rows>(
      `SELECT id
       FROM exercise
       WHERE id IN (${placeholders})`,
      exerciseIds,
    );

    if (exerciseRows.length !== exerciseIds.length) {
      return "exercise_not_found";
    }

    const [existingRows] = await databaseClient.query<Rows>(
      `SELECT exercise_id
       FROM workout_session_exercise
       WHERE workout_session_id = ?
         AND exercise_id IN (${placeholders})`,
      [sessionId, ...exerciseIds],
    );

    if (existingRows.length > 0) {
      return "duplicate_exercise";
    }

    const [positionRows] = await databaseClient.query<Rows>(
      `SELECT COALESCE(MAX(position), 0) AS maxPosition
       FROM workout_session_exercise
       WHERE workout_session_id = ?`,
      [sessionId],
    );

    const maxPosition = Number(positionRows[0].maxPosition);

    const values = exerciseIds.map((exerciseId, index) => [
      sessionId,
      exerciseId,
      maxPosition + index + 1,
      DEFAULT_REST_SECONDS,
    ]);

    await databaseClient.query<Result>(
      `INSERT INTO workout_session_exercise
        (workout_session_id, exercise_id, position, rest_seconds)
       VALUES ?`,
      [values],
    );
    return "created";
  }

  async updateExerciseRest(
    sessionId: number,
    sessionExerciseId: number,
    userId: number,
    restSeconds: number | null,
  ): Promise<"updated" | "exercise_not_found" | "session_not_editable"> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT workout_session.status
       FROM workout_session_exercise
       JOIN workout_session
         ON workout_session.id = workout_session_exercise.workout_session_id
       WHERE workout_session.id = ?
         AND workout_session_exercise.id = ?
         AND workout_session.user_id = ?`,
      [sessionId, sessionExerciseId, userId],
    );

    const sessionExercise = rows[0];

    if (sessionExercise === undefined) {
      return "exercise_not_found";
    }

    if (sessionExercise.status !== "prepared") {
      return "session_not_editable";
    }

    await databaseClient.query<Result>(
      `UPDATE workout_session_exercise
       SET rest_seconds = ?
       WHERE id = ?
         AND workout_session_id = ?`,
      [restSeconds, sessionExerciseId, sessionId],
    );

    return "updated";
  }

  async removeExercise(
    sessionId: number,
    sessionExerciseId: number,
    userId: number,
  ): Promise<"deleted" | "exercise_not_found" | "session_not_editable"> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        workout_session.status,
        workout_session_exercise.position
       FROM workout_session_exercise
       JOIN workout_session
         ON workout_session.id = workout_session_exercise.workout_session_id
       WHERE workout_session.id = ?
         AND workout_session_exercise.id = ?
         AND workout_session.user_id = ?`,
      [sessionId, sessionExerciseId, userId],
    );

    const sessionExercise = rows[0];

    if (sessionExercise === undefined) {
      return "exercise_not_found";
    }

    if (sessionExercise.status !== "prepared") {
      return "session_not_editable";
    }

    await databaseClient.query<Result>(
      `DELETE FROM workout_session_exercise
       WHERE id = ?
         AND workout_session_id = ?`,
      [sessionExerciseId, sessionId],
    );

    await databaseClient.query<Result>(
      `UPDATE workout_session_exercise
       SET position = position - 1
       WHERE workout_session_id = ?
         AND position > ?
       ORDER BY position ASC`,
      [sessionId, sessionExercise.position],
    );

    return "deleted";
  }

  async reorderExercises(
    sessionId: number,
    userId: number,
    sessionExerciseIds: number[],
  ) {
    const [sessionRows] = await databaseClient.query<Rows>(
      `SELECT status
       FROM workout_session
       WHERE id = ?
         AND user_id = ?`,
      [sessionId, userId],
    );

    const session = sessionRows[0];

    if (session === undefined) {
      return "session_not_found";
    }

    if (!["prepared", "in_progress"].includes(session.status)) {
      return "session_not_reorderable";
    }

    const [exerciseRows] = await databaseClient.query<Rows>(
      `SELECT id AS sessionExerciseId
       FROM workout_session_exercise
       WHERE workout_session_id = ?`,
      [sessionId],
    );

    const existingSessionExerciseIds = new Set(
      exerciseRows.map((exercise) => Number(exercise.sessionExerciseId)),
    );

    const containsExactlyTheSameExercises =
      existingSessionExerciseIds.size === sessionExerciseIds.length &&
      sessionExerciseIds.every((sessionExerciseId) =>
        existingSessionExerciseIds.has(sessionExerciseId),
      );

    if (!containsExactlyTheSameExercises) {
      return "invalid_exercise_list";
    }

    const temporaryOffset = sessionExerciseIds.length;

    await databaseClient.query<Result>(
      `UPDATE workout_session_exercise
       SET position = position + ?
       WHERE workout_session_id = ?
       ORDER BY position DESC`,
      [temporaryOffset, sessionId],
    );

    for (const [index, sessionExerciseId] of sessionExerciseIds.entries()) {
      const newPosition = index + 1;

      await databaseClient.query<Result>(
        `UPDATE workout_session_exercise
         SET position = ?
         WHERE id = ?
         AND workout_session_id = ?`,
        [newPosition, sessionExerciseId, sessionId],
      );
    }
    return "reordered";
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
    const [setRows] = await databaseClient.query<Rows>(
      `SELECT COUNT(*) AS completedSetCount
       FROM exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       WHERE workout_session_exercise.workout_session_id = ?
         AND exercise_set.is_completed = TRUE`,
      [sessionId],
    );

    if (Number(setRows[0].completedSetCount) > 0) {
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
        TIMESTAMPDIFF(SECOND, started_at, NOW()) AS durationSeconds
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
      `SELECT exercise_set.repetitions, exercise_set.weight_kg
       FROM exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       WHERE workout_session_exercise.workout_session_id = ?
         AND exercise_set.is_completed = TRUE`,
      [sessionId],
    );
    let totalVolumeKg = 0;

    for (const set of setRows) {
      totalVolumeKg += Number(set.repetitions) * Number(set.weight_kg);
    }
    const maxSixHours = 6 * 60 * 60;
    let durationSeconds = Number(session.durationSeconds);

    if (durationSeconds > maxSixHours) {
      durationSeconds = maxSixHours;
    }

    return {
      id: session.id,
      status: session.status,
      date: session.date,
      durationSeconds,
      exerciseCount: Number(exerciseRows[0].exerciseCount),
      completedSetCount: setRows.length,
      totalVolumeKg,
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

  async readDetail(sessionId: number, userId: number) {
    const session = await this.read(sessionId, userId);

    if (session === undefined || session.status !== "completed") {
      return undefined;
    }

    const [setRows] = await databaseClient.query<Rows>(
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

    const exercises = [];

    for (const exercise of session.exercises) {
      const sets = [];

      for (const set of setRows) {
        if (set.sessionExerciseId === exercise.sessionExerciseId) {
          sets.push(set);
        }
      }

      exercises.push({
        sessionExerciseId: exercise.sessionExerciseId,
        id: exercise.id,
        slug: exercise.slug,
        name: exercise.name,
        category: exercise.category,
        position: exercise.position,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        targetWeightKg: exercise.targetWeightKg,
        targetDurationSeconds: exercise.targetDurationSeconds,
        restSeconds: exercise.restSeconds,
        sets: sets,
      });
    }

    return {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      status: session.status,
      exerciseCount: session.exerciseCount,
      completedSetCount: session.completedSetCount,
      exercises: exercises,
    };
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

  async createSet(
    workoutSessionExerciseId: number,
    repetitions: number | null,
    weightKg: number | null,
    durationSeconds: number | null,
  ) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT COALESCE(MAX(set_number), 0) + 1 AS nextSetNumber
       FROM exercise_set
       WHERE workout_session_exercise_id = ?`,
      [workoutSessionExerciseId],
    );

    const nextSetNumber = Number(rows[0].nextSetNumber);

    const [result] = await databaseClient.query<Result>(
      `INSERT INTO exercise_set
        (workout_session_exercise_id, set_number, repetitions, weight_kg, duration_seconds)
       VALUES (?, ?, ?, ?, ?)`,
      [
        workoutSessionExerciseId,
        nextSetNumber,
        repetitions,
        weightKg,
        durationSeconds,
      ],
    );

    return {
      id: result.insertId,
      setNumber: nextSetNumber,
      repetitions,
      weightKg,
      durationSeconds,
      isCompleted: false,
    };
  }

  async readSessionExerciseOwner(workoutSessionExerciseId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        workout_session.user_id AS userId,
        workout_session.status
       FROM workout_session_exercise
       JOIN workout_session
         ON workout_session_exercise.workout_session_id = workout_session.id
       WHERE workout_session_exercise.id = ?`,
      [workoutSessionExerciseId],
    );

    return rows[0];
  }

  async readSetsBySessionExercise(workoutSessionExerciseId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        set_number AS setNumber,
        repetitions,
        weight_kg AS weightKg,
        duration_seconds AS durationSeconds,
        is_completed AS isCompleted
       FROM exercise_set
       WHERE workout_session_exercise_id = ?
       ORDER BY set_number`,
      [workoutSessionExerciseId],
    );

    return rows;
  }
}

export default new WorkoutSessionRepository();
