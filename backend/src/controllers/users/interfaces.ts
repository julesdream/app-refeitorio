import type { HttpResponse } from "../../core/http-response";
import type { Result } from "../../core/result";
import { User } from "../../generated/prisma/client";

export type UserWithoutPassword = Omit<User, "password">;

export interface IUserRepository {
  findAll(): Promise<Result<UserWithoutPassword[]>>;
  findById(id: number): Promise<Result<UserWithoutPassword | null>>;
  findyByEmail(email: string): Promise<Result<User | null>>;
  create(user: Omit<User, "id">): Promise<Result<UserWithoutPassword>>;
  update(
    id: number,
    user: Partial<User>,
  ): Promise<Result<UserWithoutPassword>>;
  delete(id: number): Promise<Result<void>>;
}

export interface IUserController {
  getAllUsers(): Promise<HttpResponse<UserWithoutPassword[]>>;
  getUserById(id: number): Promise<HttpResponse<UserWithoutPassword | null>>;
  createUser(
    user: Omit<User, "id">,
  ): Promise<HttpResponse<UserWithoutPassword>>;
  updateUser(
    id: number,
    user: Partial<User>,
  ): Promise<HttpResponse<UserWithoutPassword>>;
  deleteUser(id: number): Promise<HttpResponse<void>>;
}
