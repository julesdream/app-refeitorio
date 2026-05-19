import express from "express";
import cors from "cors";
import { connectDB } from "./database";

async function main() {
  await connectDB();

  const server = express();

  server.use(cors());
  server.use(express.json());

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, () => {
    console.log(`-> Servidor rodando na porta ${PORT}!`);
  });
}

main();
