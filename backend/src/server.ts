import express from "express";
import cors from "cors";
import { connectDB } from "./database";
import { router } from "./routes";

async function main() {
  await connectDB();

  const server = express();

  server.use(cors());
  server.use(express.json());
  server.use("/api/v1", router);

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, () => {
    console.log(`-> Servidor rodando na porta ${PORT}!`);
  });
}

main();
