import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import { DEFAULT_REST_SECONDS } from "../../helpers/restTime";

class SessionExerciseRepository {
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

  async readSessionExercises(sessionId: number) {
    const [rows] = await databaseClient.query<Rows>(
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

    return rows;
  }
}

export default new SessionExerciseRepository();
