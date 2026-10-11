/// <reference types="jest" />
import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";
import historyRepository from "../src/modules/history/historyRepository";
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

    const sessionId = await workoutSessionRepository.create(1);

    expect(sessionId).toBe(42);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/status/);
    expect(String(sql)).toMatch(/'prepared'/);
    expect(params).toEqual([1]);
  });

  test("crée un nouveau brouillon quand aucun brouillon vide n'existe", async () => {
    jest
      .spyOn(workoutSessionRepository, "readAllPrepared")
      .mockResolvedValue([] as never);

    jest.spyOn(workoutSessionRepository, "create").mockResolvedValue(42);

    const response = await authenticatedRequest.post("/api/workout-sessions");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 42 });
  });

  test("réutilise le brouillon vide existant sans créer de doublon", async () => {
    jest
      .spyOn(workoutSessionRepository, "readAllPrepared")
      .mockResolvedValue([{ id: 7, exerciseCount: 0 }] as never);

    const createMock = jest
      .spyOn(workoutSessionRepository, "create")
      .mockResolvedValue(99);

    const response = await authenticatedRequest.post("/api/workout-sessions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 7 });

    expect(createMock).not.toHaveBeenCalled();
  });

  test("crée un nouveau brouillon si les prepared existantes contiennent des exercices", async () => {
    jest
      .spyOn(workoutSessionRepository, "readAllPrepared")
      .mockResolvedValue([{ id: 7, exerciseCount: 3 }] as never);

    jest.spyOn(workoutSessionRepository, "create").mockResolvedValue(8);

    const response = await authenticatedRequest.post("/api/workout-sessions");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 8 });
  });

  test("supprime une séance prepared", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      status: "prepared",
    } as never);
    jest.spyOn(workoutSessionRepository, "delete").mockResolvedValue(1);

    const response = await authenticatedRequest.delete(
      "/api/workout-sessions/7",
    );

    expect(response.status).toBe(204);
  });

  test("répond 404 si la séance n'existe pas ou n'appartient pas à l'utilisateur", async () => {
    jest
      .spyOn(workoutSessionRepository, "read")
      .mockResolvedValue(undefined as never);
    const deleteMock = jest.spyOn(workoutSessionRepository, "delete");

    const response = await authenticatedRequest.delete(
      "/api/workout-sessions/7",
    );

    expect(response.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  test("répond 409 si la séance n'est plus prepared", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      status: "in_progress",
    } as never);
    const deleteMock = jest.spyOn(workoutSessionRepository, "delete");

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

    await workoutSessionRepository.delete(7, 1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/status\s*=\s*'prepared'/);
    expect(params).toEqual([7, 1]);
  });
});

describe("US13 - Ajouter des exercices à une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ajoute plusieurs exercices à une séance préparée", async () => {
    const addExercisesMock = jest
      .spyOn(workoutSessionRepository, "addExercises")
      .mockResolvedValue("created");

    const response = await authenticatedRequest
      .post("/api/workout-sessions/7/exercises")
      .send({ exerciseIds: [3, 8, 15] });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 7,
      exerciseIds: [3, 8, 15],
    });

    expect(addExercisesMock).toHaveBeenCalledWith(7, 1, [3, 8, 15]);
  });

  test("renvoie les exercices de la séance dans leur ordre", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([
        [{ id: 7, userId: 1, status: "prepared" }],
        [],
      ] as never)
      .mockResolvedValueOnce([
        [
          { id: 3, name: "Squat", position: 1 },
          { id: 8, name: "Développé couché", position: 2 },
        ],
        [],
      ] as never)
      .mockResolvedValueOnce([[{ completedSetCount: 0 }], []] as never);

    const session = await workoutSessionRepository.read(7, 1);

    expect(session?.exercises).toEqual([
      { id: 3, name: "Squat", position: 1 },
      { id: 8, name: "Développé couché", position: 2 },
    ]);
    expect(session?.exerciseCount).toBe(2);

    expect(queryMock.mock.calls[1][1]).toEqual([7]);
  });

  test("construit l'URL de l'image des exercices de la séance", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      exerciseCount: 1,
      exercises: [
        {
          id: 3,
          slug: "squat",
          name: "Squat",
          position: 1,
        },
      ],
    } as never);

    const response = await authenticatedRequest.get("/api/workout-sessions/7");

    expect(response.status).toBe(200);
    expect(response.body.exercises[0].imageUrl).toBe(
      "/assets/images/squat.jpg",
    );
  });

  test.each([
    ["un body sans exerciseIds", {}],
    ["une liste vide", { exerciseIds: [] }],
    ["un identifiant négatif", { exerciseIds: [3, -1] }],
    ["un doublon", { exerciseIds: [3, 3] }],
  ])("refuse %s", async (_description, body) => {
    const addExercisesMock = jest.spyOn(
      workoutSessionRepository,
      "addExercises",
    );

    const response = await authenticatedRequest
      .post("/api/workout-sessions/7/exercises")
      .send(body);

    expect(response.status).toBe(400);
    expect(addExercisesMock).not.toHaveBeenCalled();
  });

  test.each([
    [404, "session_not_found"],
    [404, "exercise_not_found"],
    [409, "session_not_prepared"],
    [409, "duplicate_exercise"],
  ] as const)(
    "renvoie %i lorsque le repository retourne %s",
    async (expectedStatus, repositoryResult) => {
      jest
        .spyOn(workoutSessionRepository, "addExercises")
        .mockResolvedValue(repositoryResult);

      const response = await authenticatedRequest
        .post("/api/workout-sessions/7/exercises")
        .send({ exerciseIds: [3, 8] });

      expect(response.status).toBe(expectedStatus);
    },
  );

  test("ajoute les exercices à la suite", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ status: "prepared" }], []] as never)
      .mockResolvedValueOnce([[{ id: 3 }, { id: 8 }], []] as never)
      .mockResolvedValueOnce([[], []] as never)
      .mockResolvedValueOnce([[{ maxPosition: 2 }], []] as never)
      .mockResolvedValueOnce([{ affectedRows: 2 }, []] as never);

    const result = await workoutSessionRepository.addExercises(7, 1, [3, 8]);

    expect(result).toBe("created");

    const [insertSql, insertParams] = queryMock.mock.calls[4];

    expect(String(insertSql)).toMatch(/INSERT INTO workout_session_exercise/);
    expect(String(insertSql)).toMatch(/rest_seconds/);
    expect(insertParams).toEqual([
      [
        [7, 3, 3, 90],
        [7, 8, 4, 90],
      ],
    ]);
  });

  test("transmet une erreur de base de données", async () => {
    const databaseError = new Error("Database failure");

    jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ status: "prepared" }], []] as never)
      .mockRejectedValueOnce(databaseError);

    await expect(
      workoutSessionRepository.addExercises(7, 1, [3, 8]),
    ).rejects.toThrow("Database failure");
  });
});

describe("US14 - Ordonner les exercices d'une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("réordonne les exercices d'une séance", async () => {
    const reorderExercisesMock = jest
      .spyOn(workoutSessionRepository, "reorderExercises")
      .mockResolvedValue("reordered");

    const response = await authenticatedRequest
      .patch("/api/workout-sessions/7/exercises/order")
      .send({ sessionExerciseIds: [18, 12, 25] });

    expect(response.status).toBe(204);
    expect(reorderExercisesMock).toHaveBeenCalledWith(7, 1, [18, 12, 25]);
  });

  test.each([
    ["un body sans sessionExerciseIds", {}],
    ["une liste vide", { sessionExerciseIds: [] }],
    ["un identifiant négatif", { sessionExerciseIds: [18, -1, 25] }],
    ["un doublon", { sessionExerciseIds: [18, 18, 25] }],
  ])("refuse %s", async (_description, body) => {
    const reorderExercisesMock = jest.spyOn(
      workoutSessionRepository,
      "reorderExercises",
    );

    const response = await authenticatedRequest
      .patch("/api/workout-sessions/7/exercises/order")
      .send(body);

    expect(response.status).toBe(400);
    expect(reorderExercisesMock).not.toHaveBeenCalled();
  });

  test.each([
    ["session_not_found", 404],
    ["session_not_reorderable", 409],
    ["invalid_exercise_list", 400],
  ] as const)(
    "retourne %s avec le statut HTTP %i",
    async (repositoryResult, expectedStatus) => {
      const reorderExercisesMock = jest
        .spyOn(workoutSessionRepository, "reorderExercises")
        .mockResolvedValue(repositoryResult);

      const response = await authenticatedRequest
        .patch("/api/workout-sessions/7/exercises/order")
        .send({ sessionExerciseIds: [18, 12, 25] });

      expect(response.status).toBe(expectedStatus);
      expect(reorderExercisesMock).toHaveBeenCalledWith(7, 1, [18, 12, 25]);
    },
  );
});

describe("US13 - Retirer un exercice d'une séance préparée", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("retire un exercice de la séance", async () => {
    const removeExerciseMock = jest
      .spyOn(workoutSessionRepository, "removeExercise")
      .mockResolvedValue("deleted");

    const response = await authenticatedRequest.delete(
      "/api/workout-sessions/7/exercises/18",
    );

    expect(response.status).toBe(204);
    expect(removeExerciseMock).toHaveBeenCalledWith(7, 18, 1);
  });

  test.each([
    ["un identifiant de séance invalide", "abc", "18"],
    ["un identifiant d'exercice invalide", "7", "0"],
  ])("refuse %s", async (_description, sessionId, sessionExerciseId) => {
    const removeExerciseMock = jest.spyOn(
      workoutSessionRepository,
      "removeExercise",
    );

    const response = await authenticatedRequest.delete(
      `/api/workout-sessions/${sessionId}/exercises/${sessionExerciseId}`,
    );

    expect(response.status).toBe(400);
    expect(removeExerciseMock).not.toHaveBeenCalled();
  });

  test.each([
    ["exercise_not_found", 404],
    ["session_not_editable", 409],
  ] as const)(
    "retourne %s avec le statut HTTP %i",
    async (repositoryResult, expectedStatus) => {
      jest
        .spyOn(workoutSessionRepository, "removeExercise")
        .mockResolvedValue(repositoryResult);

      const response = await authenticatedRequest.delete(
        "/api/workout-sessions/7/exercises/18",
      );

      expect(response.status).toBe(expectedStatus);
    },
  );

  test("supprime l'exercice et referme le trou dans les positions", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([
        [{ status: "prepared", position: 2 }],
        [],
      ] as never)
      .mockResolvedValueOnce([{ affectedRows: 1 }, []] as never)
      .mockResolvedValueOnce([{ affectedRows: 2 }, []] as never);

    const result = await workoutSessionRepository.removeExercise(7, 18, 1);

    expect(result).toBe("deleted");
    expect(String(queryMock.mock.calls[1][0])).toMatch(
      /DELETE FROM workout_session_exercise/,
    );
    expect(queryMock.mock.calls[1][1]).toEqual([18, 7]);
    expect(String(queryMock.mock.calls[2][0])).toMatch(
      /SET position = position - 1/,
    );
    expect(queryMock.mock.calls[2][1]).toEqual([7, 2]);
  });
});

describe("US15 - Régler le temps de repos d'un exercice", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([60, 90, 120, 150, 180, null])(
    "accepte la durée %s",
    async (restSeconds) => {
      const updateRestMock = jest
        .spyOn(workoutSessionRepository, "updateExerciseRest")
        .mockResolvedValue("updated");

      const response = await authenticatedRequest
        .patch("/api/workout-sessions/7/exercises/18/rest")
        .send({ restSeconds });

      expect(response.status).toBe(204);
      expect(updateRestMock).toHaveBeenCalledWith(7, 18, 1, restSeconds);
    },
  );

  test.each([undefined, 0, 30, 61, 200, "90"])(
    "refuse la durée %s",
    async (restSeconds) => {
      const updateRestMock = jest.spyOn(
        workoutSessionRepository,
        "updateExerciseRest",
      );

      const response = await authenticatedRequest
        .patch("/api/workout-sessions/7/exercises/18/rest")
        .send(restSeconds === undefined ? {} : { restSeconds });

      expect(response.status).toBe(400);
      expect(updateRestMock).not.toHaveBeenCalled();
    },
  );

  test.each([
    ["exercise_not_found", 404],
    ["session_not_editable", 409],
  ] as const)(
    "retourne %s avec le statut HTTP %i",
    async (repositoryResult, expectedStatus) => {
      jest
        .spyOn(workoutSessionRepository, "updateExerciseRest")
        .mockResolvedValue(repositoryResult);

      const response = await authenticatedRequest
        .patch("/api/workout-sessions/7/exercises/18/rest")
        .send({ restSeconds: 120 });

      expect(response.status).toBe(expectedStatus);
    },
  );

  test("persiste la durée sur un exercice de séance préparée", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ status: "prepared" }], []] as never)
      .mockResolvedValueOnce([{ affectedRows: 1 }, []] as never);

    const result = await workoutSessionRepository.updateExerciseRest(
      7,
      18,
      1,
      150,
    );

    expect(result).toBe("updated");
    expect(String(queryMock.mock.calls[1][0])).toMatch(/SET rest_seconds = \?/);
    expect(queryMock.mock.calls[1][1]).toEqual([150, 18, 7]);
  });

  test("enregistre l'absence de minuteur avec null", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ status: "prepared" }], []] as never)
      .mockResolvedValueOnce([{ affectedRows: 1 }, []] as never);

    await workoutSessionRepository.updateExerciseRest(7, 18, 1, null);

    expect(queryMock.mock.calls[1][1]).toEqual([null, 18, 7]);
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
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      exerciseCount: 0,
    } as never);

    jest
      .spyOn(workoutSessionRepository, "readCurrent")
      .mockResolvedValue(undefined as never);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/start",
    );

    expect(response.status).toBe(422);
  });

  test("refuse le démarrage si une séance est déjà en cours", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      exerciseCount: 2,
    } as never);

    jest.spyOn(workoutSessionRepository, "readCurrent").mockResolvedValue({
      id: 3,
    } as never);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/start",
    );

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ currentSessionId: 3 });
  });

  test("démarre une séance préparée contenant des exercices", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      exerciseCount: 2,
    } as never);

    jest
      .spyOn(workoutSessionRepository, "readCurrent")
      .mockResolvedValue(undefined as never);

    jest.spyOn(workoutSessionRepository, "start").mockResolvedValue(1);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/start",
    );

    expect(response.status).toBe(204);
  });

  test("retourne la séance actuellement en cours", async () => {
    jest.spyOn(workoutSessionRepository, "readCurrent").mockResolvedValue({
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

describe("US22 - Abandonner une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("refuse l'abandon lorsqu'une série est déjà validée", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 7,
      status: "in_progress",
    } as never);

    jest.spyOn(workoutSessionRepository, "abandon").mockResolvedValue(0);

    const response = await authenticatedRequest.patch(
      "/api/workout-sessions/7/abandon",
    );

    expect(response.status).toBe(409);
  });

  test("transmet les paramètres dans le bon ordre pour abandonner", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ completedSetCount: 0 }], []] as never)
      .mockResolvedValueOnce([{ affectedRows: 1 }, []] as never);

    await workoutSessionRepository.abandon(7, 1);

    const [, countParams] = queryMock.mock.calls[0];
    const [, updateParams] = queryMock.mock.calls[1];

    expect(countParams).toEqual([7]);
    expect(updateParams).toEqual([7, 1]);
  });
});

describe("US23 - Historique des séances", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ne lit que les séances terminées de l'utilisateur, triées sur started_at", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await historyRepository.readAllCompleted(1);

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

    const sessions = await historyRepository.readAllCompleted(1);

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

    const sessions = await historyRepository.readAllCompleted(1);

    expect(sessions).toEqual([
      { id: 10, date: "2026-10-03T16:00:00.000Z", durationSeconds: 3660 },
      { id: 11, date: "2026-09-28T16:00:00.000Z", durationSeconds: 1800 },
    ]);
  });

  test("renvoie l'historique de l'utilisateur connecté", async () => {
    jest.spyOn(historyRepository, "readAllCompleted").mockResolvedValue([
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
      .spyOn(historyRepository, "readAllCompleted")
      .mockResolvedValue([] as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/history",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("demande l'historique du seul utilisateur authentifié", async () => {
    const repositoryMock = jest
      .spyOn(historyRepository, "readAllCompleted")
      .mockResolvedValue([] as never);

    await authenticatedRequest.get("/api/workout-sessions/history");

    expect(repositoryMock).toHaveBeenCalledWith(1);
  });

  test("refuse l'accès sans cookie d'authentification", async () => {
    const repositoryMock = jest
      .spyOn(historyRepository, "readAllCompleted")
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

  test("range chaque série sous son exercice, et donne un tableau vide aux autres", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 10,
      status: "completed",
      exercises: [
        { sessionExerciseId: 1, name: "Développé couché" },
        { sessionExerciseId: 2, name: "Rowing" },
      ],
    } as never);

    jest.spyOn(databaseClient, "query").mockResolvedValue([
      [
        {
          sessionExerciseId: 1,
          setNumber: 1,
          repetitions: 8,
          weightKg: "62.50",
        },
        {
          sessionExerciseId: 1,
          setNumber: 2,
          repetitions: 7,
          weightKg: "60.00",
        },
      ],
      [],
    ] as never);

    const session = await workoutSessionRepository.readDetail(10, 1);

    expect(session?.exercises[0].sets).toHaveLength(2);
    expect(session?.exercises[1].sets).toEqual([]);
  });

  test("ne lit que les séries validées de la séance, triées par numéro", async () => {
    jest.spyOn(workoutSessionRepository, "read").mockResolvedValue({
      id: 10,
      status: "completed",
      exercises: [],
    } as never);

    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([[], []] as never);

    await workoutSessionRepository.readDetail(10, 1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/is_completed\s*=\s*TRUE/);
    expect(String(sql)).toMatch(/ORDER BY exercise_set\.set_number/);
    expect(params).toEqual([10]);
  });

  test("ne lit aucune série si la séance n'appartient pas à l'utilisateur", async () => {
    jest
      .spyOn(workoutSessionRepository, "read")
      .mockResolvedValue(undefined as never);

    const queryMock = jest.spyOn(databaseClient, "query");

    const session = await workoutSessionRepository.readDetail(10, 2);

    expect(session).toBeUndefined();
    expect(queryMock).not.toHaveBeenCalled();
  });

  test("renvoie le détail de la séance de l'utilisateur connecté", async () => {
    const repositoryMock = jest
      .spyOn(workoutSessionRepository, "readDetail")
      .mockResolvedValue({
        id: 10,
        exercises: [
          { sessionExerciseId: 1, slug: "developpe-couche", sets: [] },
        ],
      } as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/10/details",
    );

    expect(response.status).toBe(200);
    expect(response.body.exercises[0].imageUrl).toBeDefined();
    expect(repositoryMock).toHaveBeenCalledWith(10, 1);
  });

  test("répond 404 si la séance est absente ou appartient à un autre utilisateur", async () => {
    jest
      .spyOn(workoutSessionRepository, "readDetail")
      .mockResolvedValue(undefined as never);

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/999/details",
    );

    expect(response.status).toBe(404);
  });

  test("répond 400 si l'identifiant est invalide", async () => {
    const repositoryMock = jest.spyOn(workoutSessionRepository, "readDetail");

    const response = await authenticatedRequest.get(
      "/api/workout-sessions/abc/details",
    );

    expect(response.status).toBe(400);
    expect(repositoryMock).not.toHaveBeenCalled();
  });

  test("refuse l'accès sans cookie d'authentification", async () => {
    const repositoryMock = jest.spyOn(workoutSessionRepository, "readDetail");

    const response = await request(app).get("/api/workout-sessions/10/details");

    expect(response.status).toBe(401);
    expect(repositoryMock).not.toHaveBeenCalled();
  });
});

describe("US17 - Ajouter et enregistrer une série", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ajoute une série non validée à un exercice de la séance en cours", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 1, status: "in_progress" } as never);

    const createSetMock = jest
      .spyOn(workoutSessionRepository, "createSet")
      .mockResolvedValue({
        id: 12,
        setNumber: 2,
        repetitions: 10,
        weightKg: 40,
        durationSeconds: null,
        isCompleted: false,
      });

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send({ repetitions: 10, weightKg: 40 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 12,
      setNumber: 2,
      repetitions: 10,
      weightKg: 40,
      durationSeconds: null,
      isCompleted: false,
    });
    expect(createSetMock).toHaveBeenCalledWith(18, 10, 40, null);
  });

  test.each(["abc", "0", "-3", "1.5"])(
    "refuse l'identifiant invalide %s",
    async (sessionExerciseId) => {
      const createSetMock = jest.spyOn(workoutSessionRepository, "createSet");

      const response = await authenticatedRequest
        .post(`/api/session-exercises/${sessionExerciseId}/sets`)
        .send({ repetitions: 10 });

      expect(response.status).toBe(400);
      expect(createSetMock).not.toHaveBeenCalled();
    },
  );

  test.each([
    [{}, "aucune valeur"],
    [{ repetitions: 0 }, "zéro répétition"],
    [{ repetitions: 8.5 }, "répétitions décimales"],
    [{ weightKg: -10 }, "charge négative"],
    [{ durationSeconds: 1.5 }, "durée décimale"],
  ])("refuse %s (%s)", async (body, _description) => {
    const createSetMock = jest.spyOn(workoutSessionRepository, "createSet");

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send(body);

    expect(response.status).toBe(422);
    expect(createSetMock).not.toHaveBeenCalled();
  });

  test("ne révèle pas un exercice appartenant à un autre utilisateur", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 2, status: "in_progress" } as never);

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send({ repetitions: 10 });

    expect(response.status).toBe(404);
  });

  test("refuse l'ajout si la séance n'est pas en cours", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 1, status: "prepared" } as never);

    const createSetMock = jest.spyOn(workoutSessionRepository, "createSet");

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send({ repetitions: 10 });

    expect(response.status).toBe(409);
    expect(createSetMock).not.toHaveBeenCalled();
  });

  test("calcule le prochain numéro et insère la série sans transaction", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ nextSetNumber: 3 }], []] as never)
      .mockResolvedValueOnce([{ insertId: 42 }, []] as never);

    const result = await workoutSessionRepository.createSet(18, 10, 40, null);

    expect(result).toEqual({
      id: 42,
      setNumber: 3,
      repetitions: 10,
      weightKg: 40,
      durationSeconds: null,
      isCompleted: false,
    });
    expect(String(queryMock.mock.calls[0][0])).not.toMatch(/FOR UPDATE/);
    expect(String(queryMock.mock.calls[1][0])).not.toMatch(/is_completed/);
    expect(queryMock.mock.calls[1][1]).toEqual([18, 3, 10, 40, null]);
  });

  test("renvoie les séries existantes dans leur ordre", async () => {
    jest
      .spyOn(workoutSessionRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 1, status: "in_progress" } as never);
    jest
      .spyOn(workoutSessionRepository, "readSetsBySessionExercise")
      .mockResolvedValue([
        { id: 3, setNumber: 1 },
        { id: 7, setNumber: 2 },
      ] as never);

    const response = await authenticatedRequest.get(
      "/api/session-exercises/18/sets",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 3, setNumber: 1 },
      { id: 7, setNumber: 2 },
    ]);
  });
});
