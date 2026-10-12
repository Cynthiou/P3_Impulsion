import type { RequestHandler } from "express";
import { getCurrentUserId } from "../../helpers/currentUser";
import historyRepository from "./historyRepository";

const browseHistory: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessions = await historyRepository.readAllCompleted(userId);

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

const readDetail: RequestHandler = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      res.sendStatus(400);
      return;
    }

    const session = await historyRepository.readCompletedSession(
      sessionId,
      userId,
    );

    if (session === undefined) {
      res.sendStatus(404);
      return;
    }

    const exercises = await historyRepository.readSessionExercises(session.id);
    const sets = await historyRepository.readCompletedSets(session.id);

    res.json({
      id: session.id,
      startedAt: session.startedAt,
      durationSeconds: Number(session.durationSeconds),
      exerciseCount: Number(session.exerciseCount),
      exercises: exercises,
      sets: sets,
    });
  } catch (err) {
    next(err);
  }
};

export default { browseHistory, readDetail };
