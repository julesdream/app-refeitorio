import { AuthResponse, IAuthService } from "../controllers/auth/interfaces";
import { IUserRepository } from "../controllers/users/interfaces";
import { Result } from "../core/result";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService implements IAuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async login(email: string, password: string): Promise<Result<AuthResponse>> {
    const result = await this.userRepository.findyByEmail(email);

    if (!result.ok) return result;

    if (!result.body)
      return { ok: false, error: "Usuário ou senha incorretos" };

    const isPasswordValid = await bcrypt.compare(
      password,
      result.body.password,
    );

    if (!isPasswordValid)
      return { ok: false, error: "Usuário ou senha incorretos" };

    const { password: _, ...userWithoutPassword } = result.body;

    const token = jwt.sign(
      { sub: userWithoutPassword.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    return { ok: true, body: { user: userWithoutPassword, token } };
  }
}