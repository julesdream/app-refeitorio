import { Router } from "express";
import { foodRouter } from "./food";
import { userRouter } from "./user";
import { authRouter } from "./auth";
import { menuRouter } from "./menu";
import { authMiddleware } from "../middlewares/auth-middleware";
import { docsRouter } from "./docs";

export const router = Router();

router.use("/auth", authRouter);

router.use(authMiddleware);
router.use("/foods", foodRouter);
router.use("/users", userRouter);
router.use("/menus", menuRouter);
