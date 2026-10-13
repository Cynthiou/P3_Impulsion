/// <reference types="jest" />
import "dotenv/config";
import jwt from "jsonwebtoken";
import request from "supertest";

import databaseClient from "../database/client";
import app from "../src/app";
import workoutTemplateRepository from "../src/modules/workout-template/workoutTemplateRepository";

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

describe("US15 - Repos d'une séance type", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([30, 60, 90, 120, 150, null])(
    "accepte la durée %s",
    async (restSeconds) => {
      const updateRestMock = jest
        .spyOn(workoutTemplateRepository, "updateExerciseRest")
        .mockResolvedValue(1);

      const response = await authenticatedRequest
        .patch("/api/workout-templates/4/exercises/12/rest")
        .send({ restSeconds });

      expect(response.status).toBe(204);
      expect(updateRestMock).toHaveBeenCalledWith(4, 12, 1, restSeconds);
    },
  );

  test.each([undefined, 0, 180, 61, 200, "90"])(
    "refuse la durée %s",
    async (restSeconds) => {
      const updateRestMock = jest.spyOn(
        workoutTemplateRepository,
        "updateExerciseRest",
      );

      const response = await authenticatedRequest
        .patch("/api/workout-templates/4/exercises/12/rest")
        .send(restSeconds === undefined ? {} : { restSeconds });

      expect(response.status).toBe(400);
      expect(updateRestMock).not.toHaveBeenCalled();
    },
  );

  test("persiste le repos sur l'exercice de séance type", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValue([{ affectedRows: 1 }, []] as never);

    const affectedRows = await workoutTemplateRepository.updateExerciseRest(
      4,
      12,
      1,
      120,
    );

    expect(affectedRows).toBe(1);
    expect(String(queryMock.mock.calls[0][0])).toMatch(
      /SET.*rest_seconds = \?/s,
    );
    expect(queryMock.mock.calls[0][1]).toEqual([120, 4, 12, 1]);
  });

  test("prépare une séance en héritant du temps de repos", async () => {
    const queryMock = jest
      .spyOn(databaseClient, "query")
      .mockResolvedValueOnce([[{ id: 4 }], []] as never)
      .mockResolvedValueOnce([{ insertId: 32 }, []] as never)
      .mockResolvedValueOnce([{ affectedRows: 3 }, []] as never);

    const sessionId = await workoutTemplateRepository.prepareSession(4, 1);

    expect(sessionId).toBe(32);
    expect(String(queryMock.mock.calls[2][0])).toMatch(
      /INSERT INTO workout_session_exercise[\s\S]*rest_seconds[\s\S]*SELECT[\s\S]*rest_seconds/,
    );
    expect(queryMock.mock.calls[2][1]).toEqual([32, 4]);
  });

  test("retourne la séance préparée par l'API", async () => {
    jest
      .spyOn(workoutTemplateRepository, "prepareSession")
      .mockResolvedValue(32);

    const response = await authenticatedRequest.post(
      "/api/workout-templates/4/sessions",
    );

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 32 });
    expect(workoutTemplateRepository.prepareSession).toHaveBeenCalledWith(4, 1);
  });

  test("refuse une séance type qui n'appartient pas à l'utilisateur", async () => {
    jest
      .spyOn(workoutTemplateRepository, "prepareSession")
      .mockResolvedValue(undefined);

    const response = await authenticatedRequest.post(
      "/api/workout-templates/4/sessions",
    );

    expect(response.status).toBe(404);
  });
});
