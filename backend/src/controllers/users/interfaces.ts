import type { HttpResponse } from "../../core/http-response";
import type { Result } from "../../core/result";
import { User } from "../../generated/prisma/client";

export interface IUserRepository {
  findAll(): Promise<Result<User[]>>;
  findById(id: string): Promise<Result<User | null>>;
  create(user: Omit<User, "id">): Promise<Result<User>>;
  update(id: string, user: Partial<User>): Promise<Result<User>>;
  delete(id: string): Promise<Result<void>>;
}

export interface IUserController {
  getAllUsers(): Promise<HttpResponse<Omit<User, "password">[]>>;
  getUserById(id: string): Promise<HttpResponse<Omit<User, "password"> | null>>;
  createUser(user: Omit<User, "id">): Promise<HttpResponse<User>>;
  updateUser(id: string, user: Partial<User>): Promise<HttpResponse<User>>;
  deleteUser(id: string): Promise<HttpResponse<void>>;
}