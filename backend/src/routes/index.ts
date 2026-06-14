import { Router } from "express";
import { foodRouter } from "./food";
import { userRouter } from "./user";
import { authRouter } from "./auth";

export const router = Router();

router.use("/foods", foodRouter);
router.use("/users", userRouter);
router.use("/auth", authRouter);