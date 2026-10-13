import type { RequestHandler } from "express";
import { getCurrentUserId } from "../../helpers/currentUser";
import exerciseSetRepository from "./exerciseSetRepository";
import type { ExerciseSetUpdate } from "./exerciseSetTypes";

const update: RequestHandler = async (req, res, next) => {
  try {
    const exerciseSetId = Number(req.params.id);
    const userId = getCurrentUserId(req);
    const { repetitions, weightKg, durationSeconds, isCompleted } =
      req.body ?? {};

    if (!Number.isInteger(exerciseSetId) || exerciseSetId <= 0) {
      res.status(400).json({ error: "Identifiant invalide" });
      return;
    }

    if (typeof isCompleted !== "boolean") {
      res.status(422).json({ errors: { isCompleted: "Valeur invalide" } });
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

    if (isCompleted && repetitions == null) {
      res.status(422).json({
        errors: {
          repetitions: "Les répétitions sont requises pour valider la série",
        },
      });
      return;
    }

    const exerciseSet = await exerciseSetRepository.readForUser(
      exerciseSetId,
      userId,
    );

    if (exerciseSet === undefined) {
      res.sendStatus(404);
      return;
    }

    if (
      !["prepared", "in_progress"].includes(exerciseSet.sessionStatus) ||
      (exerciseSet.sessionStatus === "prepared" && isCompleted)
    ) {
      res.sendStatus(409);
      return;
    }

    const values: ExerciseSetUpdate = {
      repetitions: repetitions ?? null,
      weightKg: weightKg ?? null,
      durationSeconds: durationSeconds ?? null,
      isCompleted,
    };

    const isUnchanged =
      exerciseSet.repetitions === values.repetitions &&
      exerciseSet.weightKg === values.weightKg &&
      exerciseSet.durationSeconds === values.durationSeconds &&
      exerciseSet.isCompleted === values.isCompleted;

    if (!isUnchanged) {
      const affectedRows = await exerciseSetRepository.update(
        exerciseSetId,
        userId,
        values,
      );

      if (affectedRows === 0) {
        res.sendStatus(409);
        return;
      }
    }

    res.json({
      id: exerciseSetId,
      setNumber: exerciseSet.setNumber,
      ...values,
    });
  } catch (error) {
    next(error);
  }
};

export default { update };
