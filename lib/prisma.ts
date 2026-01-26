import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "209.97.164.21",
  user: process.env.DATABASE_USER || "notcis",
  password: process.env.DATABASE_PASSWORD || "coop2012",
  database: process.env.DATABASE_NAME || "election_online",
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
