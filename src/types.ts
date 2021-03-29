import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import session from "express-session";

export type Context = {
  req: Request & { session: session.Session & { userId?: number } };
  res: Response;
  prisma: PrismaClient;
};
