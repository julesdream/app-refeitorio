import { toHttpResponse, type HttpResponse } from "../../core/http-response";
import { User } from "../../generated/prisma/client";
import type { IUserController, IUserRepository } from "./interfaces.js";
import bcrypt from "bcrypt";

export class UserController implements IUserController {
  constructor(private readonly userRepository: IUserRepository) {}

  async getAllUsers(): Promise<HttpResponse<Omit<User, "password">[]>> {
    const result = await this.userRepository.findAll();

    return toHttpResponse(result);
  }

  async getUserById(
    id: number,
  ): Promise<HttpResponse<Omit<User, "password"> | null>> {
    const result = await this.userRepository.findById(id);

    return toHttpResponse(result);
  }

  async createUser(user: Omit<User, "id">): Promise<HttpResponse<User>> {
    const { password, ...rest } = user;
    const hash = await bcrypt.hash(password, 10);
    const result = await this.userRepository.create({
      password: hash,
      ...rest,
    });

    return toHttpResponse(result, 201);
  }

  async updateUser(
    id: number,
    user: Omit<User, "id">,
  ): Promise<HttpResponse<User>> {
    let updateUser = user;

    if ("password" in user) {
      const { password, ...rest } = user;
      const hash = await bcrypt.hash(password, 10);
      updateUser = { password: hash, ...rest };
    }

    const result = await this.userRepository.update(id, updateUser);

    return toHttpResponse(result);
  }

  async deleteUser(id: number): Promise<HttpResponse<void>> {
    const result = await this.userRepository.delete(id);

    return toHttpResponse(result);
  }
}
