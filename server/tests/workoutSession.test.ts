/// <reference types="jest" />
import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";
import sessionExerciseRepository from "../src/modules/session-exercise/sessionExerciseRepository";
import workoutSessionRepository from "../src/modules/workout-session/workoutSessionRepository";

const appSecret = process.env.APP_SECRET;

if (appSecret === undefined) {
  throw new Error("APP_SECRET n'est pas configuré");
}

const authToken = jwt.sign({}, appSecret, {
  subject: "1",
  expiresIn: "1h",
});

const authenticatedRequest = request
  .agent(app)
  .set("Cookie", `auth_token=${authToken}`);

describe("US11 - Workout sessions", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("crée une séance avec le statut prepared", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([{ insertId: 42 }, []] as never);

    const sessionId = await workoutSessionRepository.createSession(1);

    expect(sessionId).toBe(42);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/status/);
    expect(String(sql)).toMatch(/'prepared'/);
    expect(params).toEqual([1]);
  });

  test("crée un nouveau brouillon quand aucun brouillon vide n'existe", async () => {
    jest
      .spyOn(workoutSessionRepository, "readPreparedSessions")
      .mockResolvedValue([] as never);

    jest.spyOn(workoutSessionRepository, "createSession").mockResolvedValue(42);

    const response = await authenticatedRequest.post("/api/workout-sessions");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 42 });
  });

  test("réutilise le brouillon vide existant sans créer de doublon", async () => {
    jest
      .spyOn(workoutSessionRepository, "readPreparedSessions")
      .mockResolvedValue([{ id: 7, exerciseCount: 0 }] as never);

    const createMock = jest
      .spyOn(workoutSessionRepository, "createSession")
      .mockResolvedValue(99);

    const response = await authenticatedRequest.post("/api/workout-sessions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 7 });

    expect(createMock).not.toHaveBeenCalled();
  });

  test("crée un nouveau brouillon si les prepared existantes contiennent des exercices", async () => {
    jest
      .spyOn(workoutSessionRepository, "readPreparedSessions")
      .mockResolvedValue([{ id: 7, exerciseCount: 3 }] as never);

    jest.spyOn(workoutSessionRepository, "createSession").mockResolvedValue(8);

    const response = await authenticatedRequest.post("/api/workout-sessions");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 8 });
  });

  test("supprime une séance prepared", async () => {
    jest.spyOn(workoutSessionRepository, "readSession").mockResolvedValue({
      id: 7,
      status: "prepared",
    } as never);
    jest.spyOn(workoutSessionRepository, "deleteSession").mockResolvedValue(1);

    const response = await authenticatedRequest.delete(
      "/api/workout-sessions/7",
    );

    expect(response.status).toBe(204);
  });

  test("répond 404 si la séance n'existe pas ou n'appartient pas à l'utilisateur", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSession")
      .mockResolvedValue(undefined as never);
    const deleteMock = jest.spyOn(workoutSessionRepository, "deleteSession");

    const response = await authenticatedRequest.delete(
      "/api/workout-sessions/7",
    );

    expect(response.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  test("répond 409 si la séance n'est plus prepared", async () => {
    jest.spyOn(workoutSessionRepository, "readSession").mockResolvedValue({
      id: 7,
      status: "in_progress",
    } as never);
    const deleteMock = jest.spyOn(workoutSessionRepository, "deleteSession");

    const response = await authenticatedRequest.delete(
      "/api/workout-sessions/7",
    );

    expect(response.status).toBe(409);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  test("le DELETE du repository est limité aux séances prepared", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([{ affectedRows: 0 }, []] as never);

    await workoutSessionRepository.deleteSession(7, 1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/status\s*=\s*'prepared'/);
    expect(params).toEqual([7, 1]);
  });
});

describe("US16 - Démarrer une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("refuse un identifiant de séance invalide", async () => {
    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/12abc/start",
    );

    expect(response.status).toBe(400);
  });

  test("refuse de démarrer une séance vide", async () => {
    jest.spyOn(workoutSessionRepository, "readSession").mockResolvedValue({
      id: 7,
    } as never);
    jest
      .spyOn(sessionExerciseRepository, "readSessionExercises")
      .mockResolvedValue([] as never);

    jest
      .spyOn(workoutSessionRepository, "readCurrentSession")
      .mockResolvedValue(undefined as never);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/start",
    );

    expect(response.status).toBe(422);
  });

  test("refuse le démarrage si une séance est déjà en cours", async () => {
    jest.spyOn(workoutSessionRepository, "readSession").mockResolvedValue({
      id: 7,
      exerciseCount: 2,
    } as never);

    jest
      .spyOn(workoutSessionRepository, "readCurrentSession")
      .mockResolvedValue({
        id: 3,
      } as never);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/start",
    );

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ currentSessionId: 3 });
  });

  test("démarre une séance préparée contenant des exercices", async () => {
    jest.spyOn(workoutSessionRepository, "readSession").mockResolvedValue({
      id: 7,
    } as never);
    jest
      .spyOn(sessionExerciseRepository, "readSessionExercises")
      .mockResolvedValue([{ id: 3 }, { id: 8 }] as never);

    jest
      .spyOn(workoutSessionRepository, "readCurrentSession")
      .mockResolvedValue(undefined as never);

    jest.spyOn(workoutSessionRepository, "startSession").mockResolvedValue(1);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/start",
    );

    expect(response.status).toBe(204);
  });

  test("retourne la séance actuellement en cours", async () => {
    jest
      .spyOn(workoutSessionRepository, "readCurrentSession")
      .mockResolvedValue({
        id: 7,
        status: "in_progress",
      } as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/current",
    );

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(7);
    expect(response.body.status).toBe("in_progress");
  });
});

describe("US05 - Protéger les données utilisateur", () => {
  test("refuse une requête sans cookie d'authentification", async () => {
    const response = await request(app).get("/api/workout-sessions");

    expect(response.status).toBe(401);
  });

  test("refuse un JWT invalide", async () => {
    const response = await request(app)
      .get("/api/workout-sessions")
      .set("Cookie", "auth_token=token-invalide");

    expect(response.status).toBe(401);
  });
});

describe("US21 - Récapitulatif et validation d'une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("lit le récapitulatif avec la durée plafonnée et le nombre d'exercices", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await workoutSessionRepository.readSessionSummary(7, 1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/LEAST/);
    expect(String(sql)).toMatch(/COUNT\(\*\)/);
    expect(params).toEqual([7, 1]);
  });

  test("ne lit que les séries validées de la séance", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await workoutSessionRepository.readCompletedSets(7);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/is_completed\s*=\s*TRUE/);
    expect(params).toEqual([7]);
  });

  test("renvoie le récapitulatif d'une séance en cours", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionSummary")
      .mockResolvedValue({
        id: 7,
        status: "in_progress",
        date: "2026-10-05T18:00:00.000Z",
        durationSeconds: 3600,
        exerciseCount: 2,
      } as never);
    jest
      .spyOn(workoutSessionRepository, "readCompletedSets")
      .mockResolvedValue([
        { repetitions: 10, weightKg: "40.00" },
        { repetitions: 8, weightKg: "40.00" },
      ] as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/7/summary",
    );

    expect(response.status).toBe(200);
    expect(response.body.exerciseCount).toBe(2);
    expect(response.body.completedSetCount).toBe(2);
    expect(response.body.sets).toHaveLength(2);
  });

  test("répond 404 si le récapitulatif est introuvable", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionSummary")
      .mockResolvedValue(undefined as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/7/summary",
    );

    expect(response.status).toBe(404);
  });

  test("répond 409 si la séance n'est pas en cours", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionSummary")
      .mockResolvedValue({ id: 7, status: "prepared" } as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/7/summary",
    );

    expect(response.status).toBe(409);
  });

  test("répond 422 si aucune série n'est validée", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionSummary")
      .mockResolvedValue({ id: 7, status: "in_progress" } as never);
    jest
      .spyOn(workoutSessionRepository, "readCompletedSets")
      .mockResolvedValue([] as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/7/summary",
    );

    expect(response.status).toBe(422);
  });

  test("valide une séance en cours avec au moins une série", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSession")
      .mockResolvedValue({ id: 7, status: "in_progress" } as never);
    jest
      .spyOn(workoutSessionRepository, "readCompletedSets")
      .mockResolvedValue([{ repetitions: 10, weightKg: "40.00" }] as never);
    const completeMock = jest
      .spyOn(workoutSessionRepository, "completeSession")
      .mockResolvedValue(1);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/complete",
    );

    expect(response.status).toBe(204);
    expect(completeMock).toHaveBeenCalledWith(7, 1);
  });

  test("refuse de valider une séance qui n'est pas en cours", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSession")
      .mockResolvedValue({ id: 7, status: "prepared" } as never);
    const completeMock = jest.spyOn(
      workoutSessionRepository,
      "completeSession",
    );

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/complete",
    );

    expect(response.status).toBe(409);
    expect(completeMock).not.toHaveBeenCalled();
  });

  test("refuse de valider une séance sans série validée", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSession")
      .mockResolvedValue({ id: 7, status: "in_progress" } as never);
    jest
      .spyOn(workoutSessionRepository, "readCompletedSets")
      .mockResolvedValue([] as never);
    const completeMock = jest.spyOn(
      workoutSessionRepository,
      "completeSession",
    );

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/complete",
    );

    expect(response.status).toBe(422);
    expect(completeMock).not.toHaveBeenCalled();
  });

  test("répond 404 si la séance à valider est introuvable", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSession")
      .mockResolvedValue(undefined as never);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/complete",
    );

    expect(response.status).toBe(404);
  });

  test("la validation plafonne la fin de séance à 6 heures", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([{ affectedRows: 1 }, []] as never);

    await workoutSessionRepository.completeSession(7, 1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/INTERVAL 6 HOUR/);
    expect(params).toEqual([7, 1]);
  });
});

describe("US22 - Abandonner une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("refuse l'abandon lorsqu'une série est déjà validée", async () => {
    jest.spyOn(workoutSessionRepository, "readSession").mockResolvedValue({
      id: 7,
      status: "in_progress",
    } as never);

    jest
      .spyOn(workoutSessionRepository, "readCompletedSets")
      .mockResolvedValue([{ repetitions: 10, weightKg: 40 }] as never);
    const abandonMock = jest.spyOn(workoutSessionRepository, "abandonSession");

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/abandon",
    );

    expect(response.status).toBe(409);
    expect(abandonMock).not.toHaveBeenCalled();
  });

  test("transmet les paramètres dans le bon ordre pour abandonner", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([{ affectedRows: 1 }, []] as never);

    await workoutSessionRepository.abandonSession(7, 1);

    const [, updateParams] = queryMock.mock.calls[0];

    expect(updateParams).toEqual([7, 1]);
  });
});
