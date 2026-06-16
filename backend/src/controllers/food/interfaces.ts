import type { HttpResponse } from "../../core/http-response";
import type { Result } from "../../core/result";
import { Food } from "../../generated/prisma/client";

export interface IFoodRepository {
  findAll(): Promise<Result<Food[]>>;
  findById(id: number): Promise<Result<Food | null>>;
  create(food: Omit<Food, "id">): Promise<Result<Food>>;
  update(id: number, food: Partial<Food>): Promise<Result<Food>>;
  delete(id: number): Promise<Result<void>>;
}

export interface IFoodController {
  getAllFoods(): Promise<HttpResponse<Food[]>>;
  getFoodById(id: number): Promise<HttpResponse<Food | null>>;
  createFood(food: Omit<Food, "id">): Promise<HttpResponse<Food>>;
  updateFood(id: number, user: Partial<Food>): Promise<HttpResponse<Food>>;
  deleteFood(id: number): Promise<HttpResponse<void>>;
}
