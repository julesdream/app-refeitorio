import * as z from "zod";

export const foodSchema = z.object({
  name: z
    .string("Informe o nome do alimento")
    .min(2, "O nome deve ter no mínimo 2 letras"),
});
