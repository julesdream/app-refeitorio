import { Router } from "express";
import { foodRouter } from "./food";
import { userRouter } from "./user";

export const router = Router();

router.use("/foods", foodRouter);
router.use("/users", userRouter);
