import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("-> Postgres conectado com sucesso!");
  } catch (error) {
    console.error("Erro na conexão do banco de dados:", error);
  }
}
