import express from "express";
import authenticate from "./middlewares/authMiddleware";
import authActions from "./modules/auth/authActions";
import exerciseSetActions from "./modules/exercise-set/exerciseSetActions";
import exerciseActions from "./modules/exercise/exerciseActions";
import filtersActions from "./modules/filters/filtersActions";
import workoutSessionActions from "./modules/workout-session/workoutSessionActions";
import workoutTemplateActions from "./modules/workout-template/workoutTemplateActions";

const router = express.Router();

router.get("/api/exercises", exerciseActions.browse);
router.get("/api/exercises/:id", exerciseActions.read);

router.patch("/api/exercise-sets/:id", authenticate, exerciseSetActions.update);

router.use("/api/workout-sessions", authenticate);

router.use("/api/session-exercises", authenticate);
router.post("/api/session-exercises/:id/sets", workoutSessionActions.createSet);
router.get("/api/session-exercises/:id/sets", workoutSessionActions.browseSets);

router.post("/api/workout-sessions", workoutSessionActions.add);
router.post(
  "/api/workout-sessions/:id/exercises",
  workoutSessionActions.addExercises,
);
router.patch(
  "/api/workout-sessions/:id/exercises/order",
  workoutSessionActions.reorderExercises,
);
router.patch(
  "/api/workout-sessions/:id/exercises/:sessionExerciseId/rest",
  workoutSessionActions.updateExerciseRest,
);
router.delete(
  "/api/workout-sessions/:id/exercises/:sessionExerciseId",
  workoutSessionActions.removeExercise,
);
router.get("/api/workout-sessions", workoutSessionActions.browse);
router.get("/api/workout-sessions/current", workoutSessionActions.readCurrent);
router.get(
  "/api/workout-sessions/history",
  workoutSessionActions.browseHistory,
);
router.get("/api/workout-sessions/:id", workoutSessionActions.read);
router.get(
  "/api/workout-sessions/:id/summary",
  workoutSessionActions.readSummary,
);
router.get(
  "/api/workout-sessions/:id/details",
  workoutSessionActions.readDetail,
);
router.patch("/api/workout-sessions/:id/start", workoutSessionActions.start);
router.patch(
  "/api/workout-sessions/:id/complete",
  workoutSessionActions.complete,
);
router.patch(
  "/api/workout-sessions/:id/abandon",
  workoutSessionActions.abandon,
);
router.delete("/api/workout-sessions/:id", workoutSessionActions.destroy);

router.use("/api/workout-templates", authenticate);

router.get("/api/workout-templates", workoutTemplateActions.browse);
router.post(
  "/api/workout-templates/:id/sessions",
  workoutTemplateActions.prepareSession,
);
router.patch(
  "/api/workout-templates/:id/exercises/:templateExerciseId/rest",
  workoutTemplateActions.updateExerciseRest,
);

router.get("/api/categories", filtersActions.browseCategories);
router.get("/api/difficulties", filtersActions.browseDifficulties);
router.get("/api/equipment", filtersActions.browseEquipment);

router.post("/api/auth/register", authActions.register);
router.post("/api/auth/login", authActions.login);

export default router;
