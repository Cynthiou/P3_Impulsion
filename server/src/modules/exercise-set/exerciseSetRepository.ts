import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type {
  ExerciseSetUpdate,
  ExerciseSetWithSession,
} from "./exerciseSetTypes";

class ExerciseSetRepository {
  async readForUser(
    exerciseSetId: number,
    userId: number,
  ): Promise<ExerciseSetWithSession | undefined> {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        exercise_set.id,
        exercise_set.set_number AS setNumber,
        exercise_set.repetitions,
        exercise_set.weight_kg AS weightKg,
        exercise_set.duration_seconds AS durationSeconds,
        exercise_set.is_completed AS isCompleted,
        workout_session.status AS sessionStatus
       FROM exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       JOIN workout_session
         ON workout_session.id = workout_session_exercise.workout_session_id
       WHERE exercise_set.id = ?
         AND workout_session.user_id = ?`,
      [exerciseSetId, userId],
    );

    const exerciseSet = rows[0];

    if (exerciseSet === undefined) {
      return undefined;
    }

    return {
      id: Number(exerciseSet.id),
      setNumber: Number(exerciseSet.setNumber),
      repetitions:
        exerciseSet.repetitions === null
          ? null
          : Number(exerciseSet.repetitions),
      weightKg:
        exerciseSet.weightKg === null ? null : Number(exerciseSet.weightKg),
      durationSeconds:
        exerciseSet.durationSeconds === null
          ? null
          : Number(exerciseSet.durationSeconds),
      isCompleted: Boolean(exerciseSet.isCompleted),
      sessionStatus: String(exerciseSet.sessionStatus),
    };
  }

  async update(
    exerciseSetId: number,
    userId: number,
    values: ExerciseSetUpdate,
  ) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE exercise_set
       JOIN workout_session_exercise
         ON workout_session_exercise.id = exercise_set.workout_session_exercise_id
       JOIN workout_session
         ON workout_session.id = workout_session_exercise.workout_session_id
       SET exercise_set.repetitions = ?,
           exercise_set.weight_kg = ?,
           exercise_set.duration_seconds = ?,
           exercise_set.is_completed = ?
       WHERE exercise_set.id = ?
         AND workout_session.user_id = ?
         AND workout_session.status IN ('prepared', 'in_progress')`,
      [
        values.repetitions,
        values.weightKg,
        values.durationSeconds,
        values.isCompleted,
        exerciseSetId,
        userId,
      ],
    );

    return result.affectedRows;
  }
}

export default new ExerciseSetRepository();
