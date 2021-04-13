import dotenv from "dotenv";
dotenv.config();

export const __prod__ = process.env.NODE_ENV === "PRODUCTION";
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
