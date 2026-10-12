import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import databaseClient from "../../../database/client";

type UserRow = { id: number } & RowDataPacket;
type UserCredentialsRow = {
  id: number;
  hashedPassword: string;
} & RowDataPacket;
type UserProfileRow = {
  id: number;
  username: string;
  email: string;
} & RowDataPacket;

class AuthRepository {
  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<UserRow[]>(
      "SELECT id FROM user WHERE email = ?",
      [email],
    );

    return rows[0];
  }

  async readByUsername(username: string) {
    const [rows] = await databaseClient.query<UserRow[]>(
      "SELECT id FROM user WHERE username = ?",
      [username],
    );

    return rows[0];
  }

  async create(username: string, email: string, hashedPassword: string) {
    const [result] = await databaseClient.query<ResultSetHeader>(
      "INSERT INTO user(username, email, password) VALUES (?,?,?)",
      [username, email, hashedPassword],
    );

    return result.insertId;
  }

  async readCredentialsByEmail(email: string) {
    const [rows] = await databaseClient.query<UserCredentialsRow[]>(
      "SELECT id, password AS hashedPassword FROM user WHERE email = ?",
      [email],
    );

    return rows[0];
  }

  async readById(id: number) {
    const [rows] = await databaseClient.query<UserProfileRow[]>(
      "SELECT id, username, email FROM user WHERE id = ?",
      [id],
    );

    return rows[0];
  }
}

export default new AuthRepository();
