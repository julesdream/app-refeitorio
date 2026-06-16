import {
  IUserRepository,
  UserWithoutPassword,
} from "../controllers/users/interfaces";
import { parseDatabaseErrorMessage } from "../core/parse-database-error-message";
import { Result } from "../core/result";
import { prisma } from "../database";
import { User } from "../generated/prisma/client";

export class UserRepository implements IUserRepository {
  async findAll(): Promise<Result<UserWithoutPassword[]>> {
    try {
      const users = await prisma.user.findMany();

      const usersWithoutPassword = users.map(({ password, ...user }) => user);

      return { ok: true, body: usersWithoutPassword };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async findById(id: number): Promise<Result<UserWithoutPassword>> {
    try {
      const user = (await prisma.user.findUnique({
        where: { id },
      })) as User;

      if (!user) {
        return { ok: true, body: user };
      }

      const { password, ...userWithoutPassword } = user;

      return { ok: true, body: userWithoutPassword };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async findyByEmail(email: string): Promise<Result<User | null>> {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      return { ok: true, body: user };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async create(user: Omit<User, "id">): Promise<Result<UserWithoutPassword>> {
    try {
      const createdUser = await prisma.user.create({
        data: user,
      });

      const { password, ...userWithoutPassword } = createdUser;

      return { ok: true, body: userWithoutPassword };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async update(
    id: number,
    user: Partial<User>,
  ): Promise<Result<UserWithoutPassword>> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: user,
      });

      const { password, ...userWithoutPassword } = updatedUser;

      return { ok: true, body: userWithoutPassword };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async delete(id: number): Promise<Result<void>> {
    try {
      await prisma.user.delete({ where: { id } });

      return { ok: true, body: undefined };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }
}
