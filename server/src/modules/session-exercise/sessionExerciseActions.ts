import type { RequestHandler } from "express";
import { getCurrentUserId } from "../../helpers/currentUser";
import { isAllowedRestSeconds } from "../../helpers/restTime";
import sessionExerciseRepository from "./sessionExerciseRepository";

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

    const result = await sessionExerciseRepository.addExercises(
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

    const result = await sessionExerciseRepository.reorderExercises(
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

    const result = await sessionExerciseRepository.updateExerciseRest(
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

    const result = await sessionExerciseRepository.removeExercise(
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
      await sessionExerciseRepository.readSessionExerciseOwner(
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

    const createdSet = await sessionExerciseRepository.createSet(
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
      await sessionExerciseRepository.readSessionExerciseOwner(
        sessionExerciseId,
      );

    if (owner === undefined || owner.userId !== userId) {
      res.sendStatus(404);
      return;
    }

    const sets =
      await sessionExerciseRepository.readSetsBySessionExercise(
        sessionExerciseId,
      );

    res.json(sets);
  } catch (err) {
    next(err);
  }
};

export default {
  addExercises,
  reorderExercises,
  updateExerciseRest,
  removeExercise,
  createSet,
  browseSets,
};
