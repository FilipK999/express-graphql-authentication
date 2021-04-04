import { User } from "./schema/schema";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  __prod__,
} from "./constants";
import { Request, Response } from "express";
import { findUserById } from "./helpers";

export const createTokens = (user: User) => {
  const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET!, {
    expiresIn: "10m",
  });

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

export const createUserContext = async (
  req: Request,
  res: Response
): Promise<User | null> => {
  const accessToken = req.cookies["a-token"];
  const refreshToken = req.cookies["r-token"];

  if (!accessToken && !refreshToken) {
    return null;
  }

  try {
    if (accessToken) {
      const data = jwt.verify(accessToken, ACCESS_TOKEN_SECRET!) as any;
      const user = await findUserById(data.userId);

      // if the accessToken is valid
      return user;
    }
  } catch (err) {
    console.error(err);
  }

  if (!refreshToken) {
    // if the accessToken is invalid and there's no refreshToken, user is null.
    return null;
  }

  let data: { userId: number };

  try {
    data = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!) as any;
    const user = await findUserById(data.userId);

    if (!user) return null;

    const tokens = createTokens(user);
    // If the refresh token is valid, generate new tokens, including a new refresh token, prolonging the
    // "session" by 7 days.

    // To make the "session" last 7 days maximum: setAuthCookies(res, {accessToken: tokens.accessToken, refreshToken});
    setAuthCookies(res, tokens);

    return user;
  } catch {
    return null;
  }
};

export const setAuthCookies = (
  res: Response,
  tokens: {
    accessToken: string;
    refreshToken: string;
  }
) => {
  res.cookie("a-token", tokens.accessToken, {
    expires: new Date(Date.now() + 60 * 1000 * 10), // 10 min
    secure: __prod__,
    httpOnly: true,
  });
  res.cookie("r-token", tokens.refreshToken, {
    expires: new Date(Date.now() + 60 * 1000 * 60 * 24 * 7), // 7 days
    secure: __prod__,
    httpOnly: true,
  });
};
