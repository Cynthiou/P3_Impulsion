import type { RequestHandler } from "express";
import { getCurrentUserId } from "../../helpers/currentUser";
import { buildImageUrl } from "../../helpers/imageUrl";
import { isAllowedRestSeconds } from "../../helpers/restTime";
import workoutSessionRepository from "./workoutSessionRepository";

type WorkoutSessionIdParams = {
  id: string;
};

type ReorderExercisesBody = {
  sessionExerciseIds: number[];
};

type AddExercisesBody = {
  exerciseIds: number[];
};

type WorkoutSessionExerciseParams = WorkoutSessionIdParams & {
  sessionExerciseId: string;
};

type UpdateExerciseRestBody = {
  restSeconds: number | null;
};

const removeExercise: RequestHandler<WorkoutSessionExerciseParams> = async (
  req,
  res,
  next,
) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);
    const sessionExerciseId = Number(req.params.sessionExerciseId);

    if (
      !Number.isInteger(sessionId) ||
      sessionId <= 0 ||
      !Number.isInteger(sessionExerciseId) ||
      sessionExerciseId <= 0
    ) {
      res.sendStatus(400);
      return;
    }

    const result = await workoutSessionRepository.removeExercise(
      sessionId,
      sessionExerciseId,
      userId,
    );

    if (result === "exercise_not_found") {
      res.sendStatus(404);
      return;
    }

    if (result === "session_not_editable") {
      res.sendStatus(409);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const updateExerciseRest: RequestHandler<
  WorkoutSessionExerciseParams,
  unknown,
  UpdateExerciseRestBody
> = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);
    const sessionExerciseId = Number(req.params.sessionExerciseId);

    if (
      !Number.isInteger(sessionId) ||
      sessionId <= 0 ||
      !Number.isInteger(sessionExerciseId) ||
      sessionExerciseId <= 0 ||
      !isAllowedRestSeconds(req.body?.restSeconds)
    ) {
      res.sendStatus(400);
      return;
    }

    const result = await workoutSessionRepository.updateExerciseRest(
      sessionId,
      sessionExerciseId,
      userId,
      req.body.restSeconds,
    );

    if (result === "exercise_not_found") {
      res.sendStatus(404);
      return;
    }

    if (result === "session_not_editable") {
      res.sendStatus(409);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const reorderExercises: RequestHandler<
  WorkoutSessionIdParams,
  unknown,
  ReorderExercisesBody
> = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }
    const sessionExerciseIds = req.body?.sessionExerciseIds;
    const hasOnlyValidSessionExerciseIds =
      Array.isArray(sessionExerciseIds) &&
      sessionExerciseIds.length > 0 &&
      sessionExerciseIds.every(
        (sessionExerciseId) =>
          Number.isInteger(sessionExerciseId) && sessionExerciseId > 0,
      );

    if (!hasOnlyValidSessionExerciseIds) {
      res.sendStatus(400);
      return;
    }

    const uniqueSessionExerciseIds = new Set(sessionExerciseIds);
    if (uniqueSessionExerciseIds.size !== sessionExerciseIds.length) {
      res.sendStatus(400);
      return;
    }
    const result = await workoutSessionRepository.reorderExercises(
      sessionId,
      userId,
      sessionExerciseIds,
    );

    if (result === "session_not_found") {
      res.sendStatus(404);
      return;
    }

    if (result === "session_not_reorderable") {
      res.sendStatus(409);
      return;
    }

    if (result === "invalid_exercise_list") {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const addExercises: RequestHandler<
  WorkoutSessionIdParams,
  unknown,
  AddExercisesBody
> = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const exerciseIds = req.body?.exerciseIds;
    const hasOnlyValidExerciseIds =
      Array.isArray(exerciseIds) &&
      exerciseIds.length > 0 &&
      exerciseIds.every(
        (exerciseId) => Number.isInteger(exerciseId) && exerciseId > 0,
      );

    if (!hasOnlyValidExerciseIds) {
      res.sendStatus(400);
      return;
    }

    const uniqueExerciseIds = new Set(exerciseIds);
    if (uniqueExerciseIds.size !== exerciseIds.length) {
      res.sendStatus(400);
      return;
    }
    const result = await workoutSessionRepository.addExercises(
      sessionId,
      userId,
      exerciseIds,
    );

    if (result === "session_not_found" || result === "exercise_not_found") {
      res.sendStatus(404);
      return;
    }

    if (result === "session_not_prepared" || result === "duplicate_exercise") {
      res.sendStatus(409);
      return;
    }

    res.status(201).json({
      id: sessionId,
      exerciseIds,
    });
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessions = await workoutSessionRepository.readAllPrepared(userId);
    const emptySession = sessions.find(
      (session) => session.exerciseCount === 0,
    );

    if (emptySession) {
      res.status(200).json({ id: emptySession.id });
      return;
    }
    const sessionId = await workoutSessionRepository.create(userId);

    res.status(201).json({ id: sessionId });
  } catch (err) {
    next(err);
  }
};

const browse: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessions = await workoutSessionRepository.readAllPrepared(userId);

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const session = await workoutSessionRepository.read(sessionId, userId);

    if (session == null) {
      res.sendStatus(404);
      return;
    }

    const sessionWithImages = {
      ...session,
      exercises: session.exercises.map((exercise) => ({
        ...exercise,
        imageUrl: buildImageUrl(exercise.slug),
      })),
    };

    res.json(sessionWithImages);
  } catch (err) {
    next(err);
  }
};

const start: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const session = await workoutSessionRepository.read(sessionId, userId);

    if (session === undefined) {
      res.sendStatus(404);
      return;
    }

    const currentSession = await workoutSessionRepository.readCurrent(userId);

    if (currentSession) {
      res.status(409).json({ currentSessionId: currentSession.id });
      return;
    }

    if (session.exerciseCount === 0) {
      res.sendStatus(422);
      return;
    }

    const affectedRows = await workoutSessionRepository.start(
      sessionId,
      userId,
    );

    if (affectedRows === 0) {
      res.sendStatus(422);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const readSummary: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const summary = await workoutSessionRepository.readSummary(
      sessionId,
      userId,
    );

    if (summary === undefined) {
      res.sendStatus(404);
      return;
    }

    if (summary.status !== "in_progress") {
      res.sendStatus(409);
      return;
    }

    const numberOfCompletedSets = Number(summary.completedSetCount);

    if (numberOfCompletedSets === 0) {
      res.sendStatus(422);
      return;
    }

    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
};

const complete: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const summary = await workoutSessionRepository.readSummary(
      sessionId,
      userId,
    );

    if (summary === undefined) {
      res.sendStatus(404);
      return;
    }

    if (summary.status !== "in_progress") {
      res.sendStatus(409);
      return;
    }

    if (Number(summary.completedSetCount) === 0) {
      res.sendStatus(422);
      return;
    }

    const affectedRows = await workoutSessionRepository.complete(
      sessionId,
      userId,
    );

    if (affectedRows === 0) {
      res.sendStatus(409);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const readCurrent: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const session = await workoutSessionRepository.readCurrent(userId);

    res.json(session ?? null);
  } catch (err) {
    next(err);
  }
};

const abandon: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }
    const session = await workoutSessionRepository.read(sessionId, userId);

    if (session === undefined) {
      res.sendStatus(404);
      return;
    }
    const sessionAbandon = await workoutSessionRepository.abandon(
      sessionId,
      userId,
    );
    if (sessionAbandon === 1) {
      res.sendStatus(204);
      return;
    }
    res.sendStatus(409);
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const session = await workoutSessionRepository.read(sessionId, userId);

    if (session === undefined) {
      res.sendStatus(404);
      return;
    }

    if (session.status !== "prepared") {
      res.sendStatus(409);
      return;
    }

    await workoutSessionRepository.delete(sessionId, userId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

const createSet: RequestHandler = async (req, res, next) => {
  try {
    const sessionExerciseId = Number(req.params.id);
    const { repetitions, weightKg, durationSeconds } = req.body ?? {};
    const userId = getCurrentUserId(req);

    if (!Number.isInteger(sessionExerciseId) || sessionExerciseId <= 0) {
      res.status(400).json({ error: "Identifiant invalide" });
      return;
    }

    if (
      repetitions != null &&
      (!Number.isInteger(repetitions) || repetitions <= 0)
    ) {
      res.status(422).json({ errors: { repetitions: "Valeur invalide" } });
      return;
    }

    if (
      weightKg != null &&
      (typeof weightKg !== "number" ||
        !Number.isFinite(weightKg) ||
        weightKg <= 0)
    ) {
      res.status(422).json({ errors: { weightKg: "Valeur invalide" } });
      return;
    }

    if (
      durationSeconds != null &&
      (!Number.isInteger(durationSeconds) || durationSeconds <= 0)
    ) {
      res.status(422).json({ errors: { durationSeconds: "Valeur invalide" } });
      return;
    }

    if (repetitions == null && weightKg == null && durationSeconds == null) {
      res.status(422).json({
        errors: {
          global: "Renseignez au moins une répétition, une charge ou une durée",
        },
      });
      return;
    }

    const owner =
      await workoutSessionRepository.readSessionExerciseOwner(
        sessionExerciseId,
      );

    if (owner === undefined || owner.userId !== userId) {
      res.sendStatus(404);
      return;
    }

    if (owner.status !== "in_progress") {
      res.sendStatus(409);
      return;
    }

    const createdSet = await workoutSessionRepository.createSet(
      sessionExerciseId,
      repetitions ?? null,
      weightKg ?? null,
      durationSeconds ?? null,
    );

    res.status(201).json(createdSet);
  } catch (err) {
    next(err);
  }
};

const browseSets: RequestHandler = async (req, res, next) => {
  try {
    const sessionExerciseId = Number(req.params.id);
    const userId = getCurrentUserId(req);

    if (!Number.isInteger(sessionExerciseId) || sessionExerciseId <= 0) {
      res.status(400).json({ error: "Identifiant invalide" });
      return;
    }

    const owner =
      await workoutSessionRepository.readSessionExerciseOwner(
        sessionExerciseId,
      );

    if (owner === undefined || owner.userId !== userId) {
      res.sendStatus(404);
      return;
    }
    const sets =
      await workoutSessionRepository.readSetsBySessionExercise(
        sessionExerciseId,
      );

    res.json(sets);
  } catch (err) {
    next(err);
  }
};

export default {
  add,
  addExercises,
  browse,
  read,
  readCurrent,
  removeExercise,
  start,
  reorderExercises,
  updateExerciseRest,
  abandon,
  readSummary,
  complete,
  destroy,
  createSet,
  browseSets,
};
