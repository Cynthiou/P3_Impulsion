import express from "express";
import authenticate from "./middlewares/authMiddleware";
import authActions from "./modules/auth/authActions";
import exerciseActions from "./modules/exercise/exerciseActions";
import filtersActions from "./modules/filters/filtersActions";
import historyActions from "./modules/history/historyActions";
import sessionExerciseActions from "./modules/session-exercise/sessionExerciseActions";
import workoutSessionActions from "./modules/workout-session/workoutSessionActions";
import workoutTemplateActions from "./modules/workout-template/workoutTemplateActions";

const router = express.Router();

router.post("/api/auth/register", authActions.register);
router.post("/api/auth/login", authActions.login);
router.post("/api/auth/logout", authActions.logout);
router.get("/api/auth/me", authenticate, authActions.isLogged);

router.get("/api/exercises", exerciseActions.browse);
router.get("/api/exercises/:id", exerciseActions.read);

router.get("/api/categories", filtersActions.browseCategories);
router.get("/api/difficulties", filtersActions.browseDifficulties);
router.get("/api/equipment", filtersActions.browseEquipment);

router.use("/api/workout-sessions", authenticate);

router.get("/api/workout-sessions/history", historyActions.browseHistory);
router.get("/api/workout-sessions/:id/details", historyActions.readDetail);

router.post("/api/workout-sessions", workoutSessionActions.add);
router.get("/api/workout-sessions", workoutSessionActions.browse);
router.get("/api/workout-sessions/current", workoutSessionActions.readCurrent);
router.get("/api/workout-sessions/:id", workoutSessionActions.read);
router.get(
  "/api/workout-sessions/:id/summary",
  workoutSessionActions.readSummary,
);
router.patch("/api/workout-sessions/:id/start", workoutSessionActions.start);
router.patch(
  "/api/workout-sessions/:id/abandon",
  workoutSessionActions.abandon,
);
router.patch(
  "/api/workout-sessions/:id/complete",
  workoutSessionActions.complete,
);
router.delete("/api/workout-sessions/:id", workoutSessionActions.destroy);

router.post(
  "/api/workout-sessions/:id/exercises",
  sessionExerciseActions.addExercises,
);
router.patch(
  "/api/workout-sessions/:id/exercises/order",
  sessionExerciseActions.reorderExercises,
);
router.patch(
  "/api/workout-sessions/:id/exercises/:sessionExerciseId/rest",
  sessionExerciseActions.updateExerciseRest,
);
router.delete(
  "/api/workout-sessions/:id/exercises/:sessionExerciseId",
  sessionExerciseActions.removeExercise,
);

router.use("/api/session-exercises", authenticate);

router.post(
  "/api/session-exercises/:id/sets",
  sessionExerciseActions.createSet,
);
router.get(
  "/api/session-exercises/:id/sets",
  sessionExerciseActions.browseSets,
);

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

export default router;
