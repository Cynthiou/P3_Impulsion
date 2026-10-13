/// <reference types="jest" />
import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";
import exerciseSetRepository from "../src/modules/exercise-set/exerciseSetRepository";

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

describe("US18 - Marquer une série comme réalisée", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([true, false])(
    "enregistre isCompleted à %s avec les valeurs ajustées",
    async (isCompleted) => {
      jest.spyOn(exerciseSetRepository, "readForUser").mockResolvedValue({
        id: 12,
        setNumber: 2,
        repetitions: 8,
        weightKg: 40,
        durationSeconds: null,
        isCompleted: !isCompleted,
        sessionStatus: "in_progress",
      });
      const updateMock = jest
        .spyOn(exerciseSetRepository, "update")
        .mockResolvedValue(1);

      const response = await authenticatedRequest
        .patch("/api/exercise-sets/12")
        .send({
          repetitions: 10,
          weightKg: 42.5,
          durationSeconds: null,
          isCompleted,
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 12,
        setNumber: 2,
        repetitions: 10,
        weightKg: 42.5,
        durationSeconds: null,
        isCompleted,
      });
      expect(updateMock).toHaveBeenCalledWith(12, 1, {
        repetitions: 10,
        weightKg: 42.5,
        durationSeconds: null,
        isCompleted,
      });
    },
  );

  test("refuse de valider une série sans répétitions", async () => {
    const readMock = jest.spyOn(exerciseSetRepository, "readForUser");

    const response = await authenticatedRequest
      .patch("/api/exercise-sets/12")
      .send({
        repetitions: null,
        weightKg: 40,
        durationSeconds: null,
        isCompleted: true,
      });

    expect(response.status).toBe(422);
    expect(response.body.errors.repetitions).toBeDefined();
    expect(readMock).not.toHaveBeenCalled();
  });

  test.each([
    ["un identifiant invalide", "/api/exercise-sets/abc", {}],
    ["un body vide", "/api/exercise-sets/12", {}],
    [
      "des répétitions nulles",
      "/api/exercise-sets/12",
      { repetitions: 0, isCompleted: false },
    ],
    [
      "une charge négative",
      "/api/exercise-sets/12",
      { repetitions: 8, weightKg: -1, isCompleted: false },
    ],
  ])("refuse %s", async (_description, url, body) => {
    const readMock = jest.spyOn(exerciseSetRepository, "readForUser");

    const response = await authenticatedRequest.patch(url).send(body);

    expect([400, 422]).toContain(response.status);
    expect(readMock).not.toHaveBeenCalled();
  });

  test("ne révèle pas une série appartenant à un autre utilisateur", async () => {
    jest
      .spyOn(exerciseSetRepository, "readForUser")
      .mockResolvedValue(undefined);

    const response = await authenticatedRequest
      .patch("/api/exercise-sets/12")
      .send({ repetitions: 8, isCompleted: true });

    expect(response.status).toBe(404);
  });

  test.each(["completed", "abandoned"])(
    "refuse la modification d'une séance %s",
    async (sessionStatus) => {
      jest.spyOn(exerciseSetRepository, "readForUser").mockResolvedValue({
        id: 12,
        setNumber: 2,
        repetitions: 8,
        weightKg: 40,
        durationSeconds: null,
        isCompleted: false,
        sessionStatus,
      });

      const response = await authenticatedRequest
        .patch("/api/exercise-sets/12")
        .send({ repetitions: 8, isCompleted: true });

      expect(response.status).toBe(409);
    },
  );

  test("modifie les valeurs d'une série préparée sans la valider", async () => {
    jest.spyOn(exerciseSetRepository, "readForUser").mockResolvedValue({
      id: 12,
      setNumber: 2,
      repetitions: 8,
      weightKg: 40,
      durationSeconds: null,
      isCompleted: false,
      sessionStatus: "prepared",
    });
    const updateMock = jest
      .spyOn(exerciseSetRepository, "update")
      .mockResolvedValue(1);

    const response = await authenticatedRequest
      .patch("/api/exercise-sets/12")
      .send({
        repetitions: 10,
        weightKg: 42.5,
        durationSeconds: null,
        isCompleted: false,
      });

    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(12, 1, {
      repetitions: 10,
      weightKg: 42.5,
      durationSeconds: null,
      isCompleted: false,
    });
  });

  test("refuse de valider une série avant le démarrage de la séance", async () => {
    jest.spyOn(exerciseSetRepository, "readForUser").mockResolvedValue({
      id: 12,
      setNumber: 2,
      repetitions: 8,
      weightKg: 40,
      durationSeconds: null,
      isCompleted: false,
      sessionStatus: "prepared",
    });
    const updateMock = jest.spyOn(exerciseSetRepository, "update");

    const response = await authenticatedRequest
      .patch("/api/exercise-sets/12")
      .send({ repetitions: 10, isCompleted: true });

    expect(response.status).toBe(409);
    expect(updateMock).not.toHaveBeenCalled();
  });

  test("limite la mise à jour à l'utilisateur et à une séance modifiable", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([{ affectedRows: 1 }, []] as never);

    const affectedRows = await exerciseSetRepository.update(12, 1, {
      repetitions: 10,
      weightKg: 42.5,
      durationSeconds: null,
      isCompleted: true,
    });

    expect(affectedRows).toBe(1);

    const [sql, params] = queryMock.mock.calls[0];

    expect(String(sql)).toMatch(/workout_session\.user_id\s*=\s*\?/);
    expect(String(sql)).toMatch(
      /status\s+IN\s+\('prepared',\s*'in_progress'\)/,
    );
    expect(params).toEqual([10, 42.5, null, true, 12, 1]);
  });

  test("refuse une requête non authentifiée", async () => {
    const response = await request(app)
      .patch("/api/exercise-sets/12")
      .send({ repetitions: 8, isCompleted: true });

    expect(response.status).toBe(401);
  });

  test("accepte une modification qui ne change aucune valeur", async () => {
    jest.spyOn(exerciseSetRepository, "readForUser").mockResolvedValue({
      id: 12,
      setNumber: 2,
      repetitions: 10,
      weightKg: 42.5,
      durationSeconds: null,
      isCompleted: false,
      sessionStatus: "in_progress",
    });
    const updateMock = jest.spyOn(exerciseSetRepository, "update");

    const response = await authenticatedRequest
      .patch("/api/exercise-sets/12")
      .send({
        repetitions: 10,
        weightKg: 42.5,
        durationSeconds: null,
        isCompleted: false,
      });

    expect(response.status).toBe(200);
    expect(updateMock).not.toHaveBeenCalled();
  });

  test("refuse la modification si la séance a changé de statut entre-temps", async () => {
    jest.spyOn(exerciseSetRepository, "readForUser").mockResolvedValue({
      id: 12,
      setNumber: 2,
      repetitions: 10,
      weightKg: 42.5,
      durationSeconds: null,
      isCompleted: false,
      sessionStatus: "in_progress",
    });
    const updateMock = jest
      .spyOn(exerciseSetRepository, "update")
      .mockResolvedValue(0);

    const response = await authenticatedRequest
      .patch("/api/exercise-sets/12")
      .send({
        repetitions: 12,
        weightKg: 42.5,
        durationSeconds: null,
        isCompleted: false,
      });

    expect(response.status).toBe(409);
    expect(updateMock).toHaveBeenCalledWith(12, 1, {
      repetitions: 12,
      weightKg: 42.5,
      durationSeconds: null,
      isCompleted: false,
    });
  });
});
