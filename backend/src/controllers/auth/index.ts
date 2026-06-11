import { HttpResponse, toHttpResponse } from "../../core/http-response";
import { UserRepository } from "../../repositories/user-repository";
import { AuthService } from "../../services/auth-service";
import { IUserRepository } from "../users/interfaces";
import { AuthResponse, IAuthController, IAuthService } from "./interfaces";

import jwt from "jsonwebtoken";

export class AuthController implements IAuthController {
  private _authService: IAuthService;
  private _userRepository: IUserRepository;

  constructor() {
    this._userRepository = new UserRepository();
    this._authService = new AuthService(this._userRepository);
  }

  async login(
    email: string,
    password: string,
  ): Promise<HttpResponse<AuthResponse>> {
    const result = await this._authService.login(email, password);

    return toHttpResponse(result);
  }
}