import { toHttpResponse, type HttpResponse } from "../../core/http-response";
import { User } from "../../generated/prisma/client";
import { UserRepository } from "../../repositories/user-repository";
import type {
  IUserController,
  IUserRepository,
  UserWithoutPassword,
} from "./interfaces.js";
import bcrypt from "bcrypt";

export class UserController implements IUserController {
  private readonly _userRepository: IUserRepository;

  constructor() {
    this._userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<HttpResponse<UserWithoutPassword[]>> {
    const result = await this._userRepository.findAll();

    return toHttpResponse(result);
  }

  async getUserById(
    id: number,
  ): Promise<HttpResponse<UserWithoutPassword | null>> {
    const result = await this._userRepository.findById(id);

    return toHttpResponse(result);
  }

  async createUser(
    user: Omit<User, "id">,
  ): Promise<HttpResponse<UserWithoutPassword>> {
    const { password, ...rest } = user;
    const hash = await bcrypt.hash(password, 10);
    const result = await this._userRepository.create({
      password: hash,
      ...rest,
    });

    return toHttpResponse(result, 201);
  }

  async updateUser(
    id: number,
    user: Omit<User, "id">,
  ): Promise<HttpResponse<UserWithoutPassword>> {
    let updateUser = user;

    if ("password" in user) {
      const { password, ...rest } = user;
      const hash = await bcrypt.hash(password, 10);
      updateUser = { password: hash, ...rest };
    }

    const result = await this._userRepository.update(id, updateUser);

    return toHttpResponse(result);
  }

  async deleteUser(id: number): Promise<HttpResponse<void>> {
    const result = await this._userRepository.delete(id);

    return toHttpResponse(result);
  }
}
