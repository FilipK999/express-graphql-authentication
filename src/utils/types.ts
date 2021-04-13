import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { User } from "../schema/schema";

export type Context = {
  req: Request;
  res: Response;
  prisma: PrismaClient;
  user: User | null;
};
