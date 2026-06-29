import {
  IMenuRepository,
  MenuResponseDTO,
} from "../controllers/menu/interfaces";
import { parseDatabaseErrorMessage } from "../core/parse-database-error-message";
import { Result } from "../core/result";
import { prisma } from "../database";
import { Menu, Food } from "../generated/prisma/client";

export class MenuRepository implements IMenuRepository {
  async findAll(): Promise<Result<MenuResponseDTO[]>> {
    try {
      const menus = await prisma.menu.findMany({
        include: {
          meals: {
            include: {
              items: {
                include: {
                  food: true,
                },
              },
            },
          },
        },
      });

      const result = menus.map((menu) => ({
        ...menu,
        meals: menu.meals.map((meal) => ({
          type: meal.type,
          foods: meal.items.map((item) => item.food),
        })),
      }));

      return { ok: true, body: result };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Menu") };
    }
  }

  async findById(id: number): Promise<Result<MenuResponseDTO | null>> {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: {
          meals: {
            include: {
              items: {
                include: {
                  food: true,
                },
              },
            },
          },
        },
      });

      if (!menu) {
        return { ok: true, body: null };
      }

      const result = {
        ...menu,
        meals: menu.meals.map((meal) => ({
          type: meal.type,
          foods: meal.items.map((item) => item.food),
        })),
      };

      return { ok: true, body: result };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Menu") };
    }
  }

  async findByDate(date: Date): Promise<Result<MenuResponseDTO | null>> {
    try {
      const menu = await prisma.menu.findUnique({
        where: { date },
        include: {
          meals: {
            include: {
              items: {
                include: {
                  food: true,
                },
              },
            },
          },
        },
      });

      if (!menu) {
        return {
          ok: true,
          body: null,
        };
      }

      const result: MenuResponseDTO = {
        ...menu,
        meals: menu.meals.map((meal) => ({
          type: meal.type,
          foods: meal.items.map((item) => item.food),
        })),
      };

      return {
        ok: true,
        body: result,
      };
    } catch (error) {
      return {
        ok: false,
        error: parseDatabaseErrorMessage(error, "Menu"),
      };
    }
  }

  async findByInterval(
    initialDate: Date,
    endDate: Date,
  ): Promise<Result<MenuResponseDTO[]>> {
    try {
      const menus = await prisma.menu.findMany({
        where: {
          date: {
            gte: initialDate,
            lte: endDate,
          },
        },
        include: {
          meals: {
            include: {
              items: {
                include: {
                  food: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      const result: MenuResponseDTO[] = menus.map((menu) => ({
        ...menu,
        meals: menu.meals.map((meal) => ({
          type: meal.type,
          foods: meal.items.map((item) => item.food),
        })),
      }));

      return {
        ok: true,
        body: result,
      };
    } catch (error) {
      return {
        ok: false,
        error: parseDatabaseErrorMessage(error, "Menu"),
      };
    }
  }

  async create(date: Date): Promise<Result<Menu>> {
    try {
      const menu = await prisma.menu.create({ data: { date } });

      return { ok: true, body: menu };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Menu") };
    }
  }

  async update(id: number, menu: Menu): Promise<Result<Menu>> {
    try {
      const result = await prisma.menu.update({
        data: { ...menu },
        where: { id },
      });

      return { ok: true, body: result };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Menu") };
    }
  }

  async delete(id: number): Promise<Result<void>> {
    try {
      await prisma.menu.delete({
        where: { id },
      });

      return { ok: true, body: undefined };
    } catch (error) {
      return { ok: false, error: parseDatabaseErrorMessage(error, "Menu") };
    }
  }
}
