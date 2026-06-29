import type { HttpResponse } from "../../core/http-response";
import type { Result } from "../../core/result";
import { MealTypes, Menu } from "../../generated/prisma/client";

export interface IMenuRepository {
  findAll(): Promise<Result<MenuResponseDTO[]>>;
  findById(id: number): Promise<Result<MenuResponseDTO | null>>;
  findByDate(date: Date): Promise<Result<MenuResponseDTO | null>>;
  findByInterval(
    initialDate: Date,
    endDate: Date,
  ): Promise<Result<MenuResponseDTO[]>>;
  create(date: Date): Promise<Result<Menu>>;
  update(id: number, menu: Menu): Promise<Result<Menu>>;
  delete(id: number): Promise<Result<void>>;
}

export interface IMenuController {
  getAllMenus(): Promise<HttpResponse<MenuResponseDTO[]>>;
  getMenuById(id: number): Promise<HttpResponse<MenuResponseDTO | null>>;
  getMenusByInterval(
    initialDate: string,
    endDate: string,
  ): Promise<HttpResponse<MenuResponseDTO[]>>;
  createMenu(menu: MenuDTO): Promise<HttpResponse<Menu>>;
  updateMenu(id: number, menu: Partial<MenuDTO>): Promise<HttpResponse<Menu>>;
  deleteMenu(id: number): Promise<HttpResponse<void>>;
}

export interface IMenuService {
  createMenu(menu: MenuDTO): Promise<Result<Menu>>;
  updateMenu(id: number, menu: Partial<MenuDTO>): Promise<Result<Menu>>;
}

export interface MenuDTO {
  date: Date;
  meals: MealDTO[];
}

export type MealDTO = {
  type: MealTypes;
  items: number[];
};

export interface MenuResponseDTO {
  id: number;
  date: Date;
  meals: MealResponseDTO[];
}

export interface MealResponseDTO {
  type: MealTypes;
  foods: FoodResponseDTO[];
}

export interface FoodResponseDTO {
  id: number;
  name: string;
}
