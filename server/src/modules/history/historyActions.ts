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

export default { browseHistory };
