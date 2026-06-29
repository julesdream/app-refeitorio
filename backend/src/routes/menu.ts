import { Router, Request, Response } from "express";
import { MenuController } from "../controllers/menu";

export const menuRouter = Router();
const menuController = new MenuController();

menuRouter.get("/", async (req: Request, res: Response) => {
  const { initialDate, endDate } = req.query;

  if (!initialDate || !endDate)
    return res
      .status(400)
      .json({ error: "Informe o intervalo para encontrar cardápios" });

  const { body, statusCode } = await menuController.getMenusByInterval(
    initialDate as string,
    endDate as string,
  );

  return res.status(statusCode).json(body);
});

menuRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: "Informe o código do cardápio" });

  const { body, statusCode } = await menuController.getMenuById(Number(id));

  return res.status(statusCode).json(body);
});

menuRouter.post("/", async (req: Request, res: Response) => {
  const menu = req.body;

  const { body, statusCode } = await menuController.createMenu(menu);

  return res.status(statusCode).json(body);
});

menuRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const menu = req.body;

  if (!id)
    return res.status(400).json({ error: "Informe o código do cardápio" });

  const { body, statusCode } = await menuController.updateMenu(
    Number(id),
    menu,
  );

  return res.status(statusCode).json(body);
});

menuRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ error: "Informe o código do cardápio" });

  const { body, statusCode } = await menuController.deleteMenu(Number(id));

  return res.status(statusCode).json(body);
});
