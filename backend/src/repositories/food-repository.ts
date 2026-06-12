import { IFoodRepository } from "../controllers/food/interfaces";
import { parseDatabaseErrorMessage } from "../core/parse-database-error-message";
import { Result } from "../core/result";
import { prisma } from "../database";
import { Food } from "../generated/prisma/client";

export class FoodRepository implements IFoodRepository {
  async findAll(): Promise<Result<Food[]>> {
    try {
      const foods = await prisma.food.findMany();

      return { ok: true, body: foods };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Comida") };
    }
  }

  async findById(id: number): Promise<Result<Food | null>> {
    try {
      const food = await prisma.food.findUnique({ where: { id } });

      return { ok: true, body: food };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Comida") };
    }
  }

  async create(food: Omit<Food, "id">): Promise<Result<Food>> {
    try {
      const createdFood = await prisma.food.create({ data: food });

      return { ok: true, body: createdFood };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Comida") };
    }
  }

  async update(id: number, food: Partial<Food>): Promise<Result<Food>> {
    try {
      const updatedFood = await prisma.food.update({
        where: { id },
        data: food,
      });

      return { ok: true, body: updatedFood };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Comida") };
    }
  }

  async delete(id: number): Promise<Result<void>> {
    try {
      await prisma.food.delete({
        where: { id },
      });

      return { ok: true, body: undefined };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Comida") };
    }
  }
}
