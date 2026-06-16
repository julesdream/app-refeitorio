import {
  IMenuRepository,
  IMenuService,
  MealDTO,
  MenuDTO,
} from "../controllers/menu/interfaces";
import { HttpResponse } from "../core/http-response";
import { parseDatabaseErrorMessage } from "../core/parse-database-error-message";
import { Result } from "../core/result";
import { prisma } from "../database";
import { MealTypes, Menu } from "../generated/prisma/client";

export class MenuService implements IMenuService {
  constructor(private readonly menuRepository: IMenuRepository) {}

  private async _validateMenu(
    menu: Partial<MenuDTO>,
    currentMenuId?: number,
  ): Promise<string | null> {
    if (menu.date) {
      const existingMenu = await this.menuRepository.findByDate(menu.date);

      if (!existingMenu.ok) {
        return existingMenu.error;
      }

      if (existingMenu.body && existingMenu.body.id !== currentMenuId) {
        return "Já existe um cardápio cadastrado para esta data";
      }
    }

    if (menu.meals) {
      const mealTypes = new Set<MealTypes>();

      for (const meal of menu.meals) {
        if (mealTypes.has(meal.type)) {
          return `A refeição ${meal.type} foi informada mais de uma vez`;
        }

        mealTypes.add(meal.type);
      }

      for (const meal of menu.meals) {
        const items = new Set<number>();

        for (const item of meal.items) {
          if (items.has(item)) {
            return `A refeição ${meal.type} possui alimentos duplicados`;
          }

          items.add(item);
        }
      }
    }

    return null;
  }

  async createMenu(menu: MenuDTO): Promise<Result<Menu>> {
    try {
      const validationError = await this._validateMenu(menu);

      if (validationError) {
        return {
          ok: false,
          error: validationError,
        };
      }

      const newMenu = await prisma.$transaction(async (tx) => {
        const menuCreated = await tx.menu.create({
          data: {
            date: menu.date,
          },
        });

        for (const meal of menu.meals) {
          await tx.meal.create({
            data: {
              menuId: menuCreated.id,
              type: meal.type,
            },
          });

          await tx.mealItem.createMany({
            data: meal.items.map((foodId) => ({
              menuId: menuCreated.id,
              mealType: meal.type,
              foodId,
            })),
          });
        }

        return menuCreated;
      });

      return {
        ok: true,
        body: newMenu,
      };
    } catch (error) {
      console.log(error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : parseDatabaseErrorMessage(error, "Menu");

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }

  async updateMenu(id: number, menu: Partial<MenuDTO>): Promise<Result<Menu>> {
    try {
      const validationError = await this._validateMenu(menu, id);

      if (validationError) {
        return {
          ok: false,
          error: validationError,
        };
      }

      const existingMenu = await this.menuRepository.findById(id);

      if (!existingMenu.ok) return existingMenu;

      if (!existingMenu.body) {
        return {
          ok: false,
          error: "Cardápio não encontrado",
        };
      }

      const updatedMenu = await prisma.$transaction(async (tx) => {
        const updated = await tx.menu.update({
          where: { id },
          data: {
            ...(menu.date && { date: menu.date }),
          },
        });

        if (menu.meals) {
          await tx.mealItem.deleteMany({
            where: { menuId: id },
          });

          await tx.meal.deleteMany({
            where: { menuId: id },
          });

          for (const meal of menu.meals) {
            await tx.meal.create({
              data: {
                menuId: id,
                type: meal.type,
              },
            });

            await tx.mealItem.createMany({
              data: meal.items.map((foodId) => ({
                menuId: id,
                mealType: meal.type,
                foodId,
              })),
            });
          }
        }

        return updated;
      });

      return {
        ok: true,
        body: updatedMenu,
      };
    } catch (error) {
      console.log(error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : parseDatabaseErrorMessage(error, "Menu");

      return {
        ok: false,
        error: errorMessage,
      };
    }
  }
}
