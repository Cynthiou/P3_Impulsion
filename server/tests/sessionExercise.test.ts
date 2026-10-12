/// <reference types="jest" />
import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";
import sessionExerciseRepository from "../src/modules/session-exercise/sessionExerciseRepository";

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

describe("US13 - Ajouter des exercices à une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ajoute plusieurs exercices à une séance préparée", async () => {
    const addExercisesMock = jest
      .spyOn(sessionExerciseRepository, "addExercises")
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
    const queryMock = jest.spyOn(databaseClient, "query").mockResolvedValue([
      [
        { id: 3, name: "Squat", position: 1 },
        { id: 8, name: "Développé couché", position: 2 },
      ],
      [],
    ] as never);

    const exercises = await sessionExerciseRepository.readSessionExercises(7);

    expect(exercises).toEqual([
      { id: 3, name: "Squat", position: 1 },
      { id: 8, name: "Développé couché", position: 2 },
    ]);
    expect(String(queryMock.mock.calls[0][0])).toMatch(/ORDER BY/);
    expect(queryMock.mock.calls[0][1]).toEqual([7]);
  });

  test.each([
    ["un body sans exerciseIds", {}],
    ["une liste vide", { exerciseIds: [] }],
    ["un identifiant négatif", { exerciseIds: [3, -1] }],
    ["un doublon", { exerciseIds: [3, 3] }],
  ])("refuse %s", async (_description, body) => {
    const addExercisesMock = jest.spyOn(
      sessionExerciseRepository,
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
        .spyOn(sessionExerciseRepository, "addExercises")
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

    const result = await sessionExerciseRepository.addExercises(7, 1, [3, 8]);

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
      sessionExerciseRepository.addExercises(7, 1, [3, 8]),
    ).rejects.toThrow("Database failure");
  });
});

describe("US14 - Ordonner les exercices d'une séance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("réordonne les exercices d'une séance", async () => {
    const reorderExercisesMock = jest
      .spyOn(sessionExerciseRepository, "reorderExercises")
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
      sessionExerciseRepository,
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
        .spyOn(sessionExerciseRepository, "reorderExercises")
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
      .spyOn(sessionExerciseRepository, "removeExercise")
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
      sessionExerciseRepository,
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
        .spyOn(sessionExerciseRepository, "removeExercise")
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

    const result = await sessionExerciseRepository.removeExercise(7, 18, 1);

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
        .spyOn(sessionExerciseRepository, "updateExerciseRest")
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
        sessionExerciseRepository,
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
        .spyOn(sessionExerciseRepository, "updateExerciseRest")
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

    const result = await sessionExerciseRepository.updateExerciseRest(
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

    await sessionExerciseRepository.updateExerciseRest(7, 18, 1, null);

    expect(queryMock.mock.calls[1][1]).toEqual([null, 18, 7]);
  });
});

describe("US17 - Ajouter et enregistrer une série", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("ajoute une série non validée à un exercice de la séance en cours", async () => {
    jest
      .spyOn(sessionExerciseRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 1, status: "in_progress" } as never);

    const createSetMock = jest
      .spyOn(sessionExerciseRepository, "createSet")
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
      const createSetMock = jest.spyOn(sessionExerciseRepository, "createSet");

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
    const createSetMock = jest.spyOn(sessionExerciseRepository, "createSet");

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send(body);

    expect(response.status).toBe(422);
    expect(createSetMock).not.toHaveBeenCalled();
  });

  test("ne révèle pas un exercice appartenant à un autre utilisateur", async () => {
    jest
      .spyOn(sessionExerciseRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 2, status: "in_progress" } as never);

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send({ repetitions: 10 });

    expect(response.status).toBe(404);
  });

  test("ajoute une série à une séance préparée", async () => {
    jest
      .spyOn(sessionExerciseRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 1, status: "prepared" } as never);

    const createSetMock = jest
      .spyOn(sessionExerciseRepository, "createSet")
      .mockResolvedValue({
        id: 12,
        setNumber: 1,
        repetitions: 10,
        weightKg: null,
        durationSeconds: null,
        isCompleted: false,
      });

    const response = await authenticatedRequest
      .post("/api/session-exercises/18/sets")
      .send({ repetitions: 10 });

    expect(response.status).toBe(201);
    expect(createSetMock).toHaveBeenCalledWith(18, 10, null, null);
  });

  test("calcule le prochain numéro et insère la série sans transaction", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ nextSetNumber: 3 }], []] as never)
      .mockResolvedValueOnce([{ insertId: 42 }, []] as never);

    const result = await sessionExerciseRepository.createSet(18, 10, 40, null);

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
      .spyOn(sessionExerciseRepository, "readSessionExerciseOwner")
      .mockResolvedValue({ userId: 1, status: "in_progress" } as never);
    jest
      .spyOn(sessionExerciseRepository, "readSetsBySessionExercise")
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
