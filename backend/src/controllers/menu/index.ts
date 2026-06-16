import { HttpResponse, toHttpResponse } from "../../core/http-response";
import { Food, Menu } from "../../generated/prisma/client";
import { MenuRepository } from "../../repositories/menu-repository";
import { MenuService } from "../../services/menu-service";
import {
  IMenuController,
  IMenuRepository,
  IMenuService,
  MenuDTO,
  MenuResponseDTO,
} from "./interfaces";

export class MenuController implements IMenuController {
  private readonly _menuRepository: IMenuRepository;
  private readonly _menuService: IMenuService;

  constructor() {
    this._menuRepository = new MenuRepository();
    this._menuService = new MenuService(this._menuRepository);
  }
  async getAllMenus(): Promise<HttpResponse<MenuResponseDTO[]>> {
    const result = await this._menuRepository.findAll();

    return toHttpResponse(result);
  }

  async getMenuById(id: number): Promise<HttpResponse<MenuResponseDTO | null>> {
    const result = await this._menuRepository.findById(id);

    return toHttpResponse(result);
  }

  async createMenu(menu: MenuDTO): Promise<HttpResponse<Menu>> {
    const menuDTO: MenuDTO = {
      ...menu,
      date: new Date(menu.date),
    };

    const result = await this._menuService.createMenu(menuDTO);

    return toHttpResponse(result);
  }

  async updateMenu(
    id: number,
    menu: Partial<MenuDTO>,
  ): Promise<HttpResponse<Menu>> {
    if ("date" in menu) {
      menu = { ...menu, date: new Date(menu.date) };
    }

    const result = await this._menuService.updateMenu(id, menu);

    return toHttpResponse(result);
  }

  async deleteMenu(id: number): Promise<HttpResponse<void>> {
    const result = await this._menuRepository.delete(id);

    return toHttpResponse(result);
  }
}
