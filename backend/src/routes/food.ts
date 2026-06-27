import { Request, Response, Router } from "express";
import { FoodController } from "../controllers/food";
import { validationMiddleware } from "../middlewares/validation-middleware";
import { foodSchema } from "../schemas/food";

export const foodRouter = Router();
const foodController = new FoodController();

foodRouter.get("/", async (req: Request, res: Response) => {
  const { body, statusCode } = await foodController.getAllFoods();

  return res.status(statusCode).json(body);
});

foodRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Informe o código da comida" });

  const { body, statusCode } = await foodController.getFoodById(Number(id));

  return res.status(statusCode).json(body);
});

foodRouter.post(
  "/",
  validationMiddleware(foodSchema),
  async (req: Request, res: Response) => {
    const food = req.body;

    const { body, statusCode } = await foodController.createFood(food);

    return res.status(statusCode).json(body);
  },
);

foodRouter.patch(
  "/:id",
  validationMiddleware(foodSchema),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const food = req.body;

    if (!id)
      return res.status(400).json({ error: "Informe o código da comida" });

    const { body, statusCode } = await foodController.updateFood(
      Number(id),
      food,
    );

    return res.status(statusCode).json(body);
  },
);

foodRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Informe o código da comida" });

  const { body, statusCode } = await foodController.deleteFood(Number(id));

  return res.status(statusCode).json(body);
});
