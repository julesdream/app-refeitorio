import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/auth";

export const authRouter = Router();
const authController = new AuthController();

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  const { body, statusCode } = await authController.login(email, password);

  return res.status(statusCode).json(body);
});