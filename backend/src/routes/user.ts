import { Router, Request, Response } from "express";
import { UserController } from "../controllers/users";

export const userRouter = Router();
const userController = new UserController();

userRouter.get("/", async (req: Request, res: Response) => {
  const { body, statusCode } = await userController.getAllUsers();

  return res.status(statusCode).json(body);
});

userRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: "Informe o código do usuário" });

  const { body, statusCode } = await userController.getUserById(Number(id));

  return res.status(statusCode).json(body);
});

userRouter.post("/", async (req: Request, res: Response) => {
  const food = req.body;

  const { body, statusCode } = await userController.createUser(food);

  return res.status(statusCode).json(body);
});

userRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const food = req.body;

  if (!id)
    return res.status(400).json({ error: "Informe o código do usuário" });

  const { body, statusCode } = await userController.updateUser(
    Number(id),
    food,
  );

  return res.status(statusCode).json(body);
});

userRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: "Informe o código do usuário" });

  const { body, statusCode } = await userController.deleteUser(Number(id));

  return res.status(statusCode).json(body);
});
