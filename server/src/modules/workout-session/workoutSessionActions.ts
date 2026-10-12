import type { RequestHandler } from "express";
import { getCurrentUserId } from "../../helpers/currentUser";
import { buildImageUrl } from "../../helpers/imageUrl";
import sessionExerciseRepository from "../session-exercise/sessionExerciseRepository";
import workoutSessionRepository from "./workoutSessionRepository";

const add: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessions =
      await workoutSessionRepository.readPreparedSessions(userId);
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
    const sessions =
      await workoutSessionRepository.readPreparedSessions(userId);

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

    const session = await workoutSessionRepository.readSession(
      sessionId,
      userId,
    );

    if (session === undefined) {
      res.sendStatus(404);
      return;
    }

    const exercises = await sessionExerciseRepository.readSessionExercises(
      session.id,
    );
    const completedSetCount =
      await workoutSessionRepository.readCompletedSetCount(session.id);

    const exercisesWithImages = exercises.map((exercise) => ({
      ...exercise,
      imageUrl: buildImageUrl(exercise.slug),
    }));

    res.json({
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      status: session.status,
      exerciseCount: exercises.length,
      completedSetCount: completedSetCount,
      exercises: exercisesWithImages,
    });
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

    const session = await workoutSessionRepository.readSession(
      sessionId,
      userId,
    );

    if (session === undefined) {
      res.sendStatus(404);
      return;
    }

    const currentSession = await workoutSessionRepository.readCurrent(userId);

    if (currentSession) {
      res.status(409).json({ currentSessionId: currentSession.id });
      return;
    }

    const exercises = await sessionExerciseRepository.readSessionExercises(
      session.id,
    );

    if (exercises.length === 0) {
      res.sendStatus(422);
      return;
    }

    const affectedRows = await workoutSessionRepository.start(
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
    const session = await workoutSessionRepository.readSession(
      sessionId,
      userId,
    );

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

    const session = await workoutSessionRepository.readSession(
      sessionId,
      userId,
    );

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

export default {
  add,
  browse,
  read,
  readCurrent,
  start,
  abandon,
  readSummary,
  complete,
  destroy,
};
