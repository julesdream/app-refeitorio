import { IUserRepository } from "../controllers/users/interfaces";
import { parseDatabaseErrorMessage } from "../core/parse-database-error-message";
import { Result } from "../core/result";
import { prisma } from "../database";
import { User } from "../generated/prisma/client";


export class UserRepository implements IUserRepository {
  async findAll(): Promise<Result<User[]>> {
    try {
      const users = await prisma.user.findMany();

      return { ok: true, body: users };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async findById(id: number): Promise<Result<User>> {
    try {
      const user = (await prisma.user.findUnique({
        where: { id },
      })) as User;

      return { ok: true, body: user };
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

  async create(user: Omit<User, "id">): Promise<Result<User>> {
    try {
      const createdUser = await prisma.user.create({
        data: user,
      });

      return { ok: true, body: createdUser };
    } catch (err) {
      return { ok: false, error: parseDatabaseErrorMessage(err, "Usuário") };
    }
  }

  async update(id: number, user: Partial<User>): Promise<Result<User>> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: user,
      });

      return { ok: true, body: updatedUser };
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