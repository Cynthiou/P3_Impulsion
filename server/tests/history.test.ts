/// <reference types="jest" />
import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";
import historyRepository from "../src/modules/history/historyRepository";

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

describe("US23 - Historique des séances", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ne lit que les séances terminées de l'utilisateur, triées sur started_at", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await historyRepository.readCompletedSessions(1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/status\s*=\s*'completed'/);
    expect(String(sql)).toMatch(/user_id\s*=\s*\?/);
    expect(String(sql)).toMatch(/ORDER BY started_at DESC/);
    expect(params).toEqual([1]);
  });

  test("renvoie un tableau vide quand il n'y a aucune séance terminée", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    const sessions = await historyRepository.readCompletedSessions(1);

    expect(sessions).toEqual([]);
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  test("renvoie la date et la durée de chaque séance", async () => {
    jest.spyOn(databaseClient, "query").mockResolvedValueOnce([
      [
        { id: 10, date: "2026-10-03T16:00:00.000Z", durationSeconds: 3660 },
        { id: 11, date: "2026-09-28T16:00:00.000Z", durationSeconds: 1800 },
      ],
      [],
    ] as never);

    const sessions = await historyRepository.readCompletedSessions(1);

    expect(sessions).toEqual([
      { id: 10, date: "2026-10-03T16:00:00.000Z", durationSeconds: 3660 },
      { id: 11, date: "2026-09-28T16:00:00.000Z", durationSeconds: 1800 },
    ]);
  });

  test("renvoie l'historique de l'utilisateur connecté", async () => {
    jest.spyOn(historyRepository, "readCompletedSessions").mockResolvedValue([
      {
        id: 10,
        date: "2026-10-03T16:00:00.000Z",
        durationSeconds: 3660,
      },
    ] as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/history",
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(10);
  });

  test("renvoie un tableau vide, et non une erreur, quand il n'y a aucune séance", async () => {
    jest
      .spyOn(historyRepository, "readCompletedSessions")
      .mockResolvedValue([] as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/history",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("demande l'historique du seul utilisateur authentifié", async () => {
    const repositoryMock = jest
      .spyOn(historyRepository, "readCompletedSessions")
      .mockResolvedValue([] as never);

    await authenticatedRequest.get("/api/workout-sessions/history");

    expect(repositoryMock).toHaveBeenCalledWith(1);
  });

  test("refuse l'accès sans cookie d'authentification", async () => {
    const repositoryMock = jest
      .spyOn(historyRepository, "readCompletedSessions")
      .mockResolvedValue([] as never);

    const response = await request(app).get("/api/workout-sessions/history");

    expect(response.status).toBe(401);
    expect(repositoryMock).not.toHaveBeenCalled();
  });
});

describe("US24 - Consulter le détail d'une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ne lit que la séance terminée de l'utilisateur", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await historyRepository.readCompletedSession(10, 1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/user_id\s*=\s*\?/);
    expect(String(sql)).toMatch(/status\s*=\s*'completed'/);
    expect(params).toEqual([10, 1]);
  });

  test("lit les exercices de la séance dans leur ordre", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await historyRepository.readSessionExercises(10);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/ORDER BY workout_session_exercise\.position/);
    expect(params).toEqual([10]);
  });

  test("ne lit que les séries validées de la séance, triées par numéro", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await historyRepository.readSessionCompletedSets(10);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/is_completed\s*=\s*TRUE/);
    expect(String(sql)).toMatch(/ORDER BY exercise_set\.set_number/);
    expect(params).toEqual([10]);
  });

  test("renvoie le détail de la séance de l'utilisateur connecté", async () => {
    const sessionMock = jest
      .spyOn(historyRepository, "readCompletedSession")
      .mockResolvedValue({
        id: 10,
        startedAt: "2026-10-03T16:00:00.000Z",
        durationSeconds: 3600,
        exerciseCount: 1,
      } as never);
    jest
      .spyOn(historyRepository, "readSessionExercises")
      .mockResolvedValue([
        { sessionExerciseId: 1, id: 4, name: "Développé couché", position: 1 },
      ] as never);
    jest
      .spyOn(historyRepository, "readSessionCompletedSets")
      .mockResolvedValue([
        { sessionExerciseId: 1, setNumber: 1, repetitions: 8, weightKg: 60 },
      ] as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/10/details",
    );

    expect(response.status).toBe(200);
    expect(response.body.exercises).toHaveLength(1);
    expect(response.body.sets).toHaveLength(1);
    expect(sessionMock).toHaveBeenCalledWith(10, 1);
  });

  test("répond 404 si la séance est absente ou à un autre utilisateur, sans lire ses exercices ni ses séries", async () => {
    jest
      .spyOn(historyRepository, "readCompletedSession")
      .mockResolvedValue(undefined as never);
    const exercisesMock = jest.spyOn(historyRepository, "readSessionExercises");
    const setsMock = jest.spyOn(historyRepository, "readSessionCompletedSets");

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/999/details",
    );

    expect(response.status).toBe(404);
    expect(exercisesMock).not.toHaveBeenCalled();
    expect(setsMock).not.toHaveBeenCalled();
  });

  test("répond 400 si l'identifiant est invalide", async () => {
    const sessionMock = jest.spyOn(historyRepository, "readCompletedSession");

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/abc/details",
    );

    expect(response.status).toBe(400);
    expect(sessionMock).not.toHaveBeenCalled();
  });

  test("refuse l'accès sans cookie d'authentification", async () => {
    const sessionMock = jest.spyOn(historyRepository, "readCompletedSession");

    const response = await request(app).get("/api/workout-sessions/10/details");

    expect(response.status).toBe(401);
    expect(sessionMock).not.toHaveBeenCalled();
  });
});
