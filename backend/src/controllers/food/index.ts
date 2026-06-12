import { HttpResponse, toHttpResponse } from "../../core/http-response";
import { Food } from "../../generated/prisma/client";
import { FoodRepository } from "../../repositories/food-repository";
import { IFoodController, IFoodRepository } from "./interfaces";

export class FoodController implements IFoodController {
  private readonly _foodRepository: IFoodRepository;

  constructor() {
    this._foodRepository = new FoodRepository();
  }

  async getAllFoods(): Promise<HttpResponse<Omit<Food, "password">[]>> {
    const result = await this._foodRepository.findAll();

    return toHttpResponse(result);
  }

  async getFoodById(
    id: number,
  ): Promise<HttpResponse<Omit<Food, "password"> | null>> {
    const result = await this._foodRepository.findById(id);

    return toHttpResponse(result);
  }

  async createFood(food: Omit<Food, "id">): Promise<HttpResponse<Food>> {
    const result = await this._foodRepository.create(food);

    return toHttpResponse(result);
  }

  async updateFood(
    id: number,
    food: Partial<Food>,
  ): Promise<HttpResponse<Food>> {
    const result = await this._foodRepository.update(id, food);

    return toHttpResponse(result);
  }

  async deleteFood(id: number): Promise<HttpResponse<void>> {
    const result = await this._foodRepository.delete(id);

    return toHttpResponse(result);
  }
}
