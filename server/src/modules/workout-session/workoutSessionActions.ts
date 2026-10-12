import type { RequestHandler } from "express";
import { getCurrentUserId } from "../../helpers/currentUser";
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

    const sessionId = await workoutSessionRepository.createSession(userId);

    res.status(201).json({ id: sessionId });
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

    const sets = await workoutSessionRepository.readCompletedSets(session.id);

    res.json({
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      status: session.status,
      exerciseCount: exercises.length,
      completedSetCount: sets.length,
      exercises: exercises,
    });
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

const readCurrent: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const session = await workoutSessionRepository.readCurrentSession(userId);

    res.json(session ?? null);
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

    const summary = await workoutSessionRepository.readSessionSummary(
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

    const sets = await workoutSessionRepository.readCompletedSets(summary.id);

    if (sets.length === 0) {
      res.sendStatus(422);
      return;
    }

    res.json({
      id: summary.id,
      status: summary.status,
      date: summary.date,
      durationSeconds: summary.durationSeconds,
      exerciseCount: summary.exerciseCount,
      completedSetCount: sets.length,
      sets: sets,
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

    const currentSession =
      await workoutSessionRepository.readCurrentSession(userId);

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

    const affectedRows = await workoutSessionRepository.startSession(
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

    const sets = await workoutSessionRepository.readCompletedSets(session.id);

    if (sets.length > 0) {
      res.sendStatus(409);
      return;
    }

    const sessionAbandon = await workoutSessionRepository.abandonSession(
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

const complete: RequestHandler = async (req, res, next) => {
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

    if (session.status !== "in_progress") {
      res.sendStatus(409);
      return;
    }

    const sets = await workoutSessionRepository.readCompletedSets(session.id);

    if (sets.length === 0) {
      res.sendStatus(422);
      return;
    }

    const affectedRows = await workoutSessionRepository.completeSession(
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

    await workoutSessionRepository.deleteSession(sessionId, userId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default {
  add,
  read,
  browse,
  readCurrent,
  readSummary,
  start,
  abandon,
  complete,
  destroy,
};
