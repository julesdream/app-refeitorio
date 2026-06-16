import { NextFunction, Request, Response } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secret = process.env.JWT_SECRET;

  if (!secret)
    return res.status(500).send({ error: "Falha durante a autenticação" });

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send({
      error: "Usuário não autorizado",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).send({ error: "Usuário não autorizado" });

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    req.userId = payload.sub as string;
    next();
  } catch {
    return res.status(401).send({ error: "Usuário não autorizado" });
  }
}
