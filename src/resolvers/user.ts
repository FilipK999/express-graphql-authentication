import { PrismaClient } from ".prisma/client";
import argon2 from "argon2";
import { __prod__ } from "../constants";
import { RegisterInput, Resolvers } from "../schema/schema";
import { setAuthCookies, createTokens } from "../auth";

export const userResolver: Resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        return null;
      }
      return user;
    },
  },
  Mutation: {
    register: async (_, args, { prisma, res }) => {
      const validation = await validate(args.input, prisma);
      if (validation) return validation;

      const hash = await argon2.hash(args.input.password);

      const user = await prisma.user.create({
        data: {
          email: args.input.email,
          username: args.input.username,
          password: hash,
          created: Date.now().toString(),
          updated: Date.now().toString(),
        },
      });

      const { accessToken, refreshToken } = createTokens(user);
      setAuthCookies(res, { accessToken, refreshToken });

      return {
        success: true,
      };
    },
    login: async (_, args, { prisma, res }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: args.input.email,
        },
      });

      if (!user) {
        return {
          success: false,
          errors: [{ field: "email", message: "Email doesn't exist" }],
        };
      }

      const passwordMatch = await argon2.verify(
        user?.password!,
        args.input.password
      );

      if (passwordMatch) {
        const { accessToken, refreshToken } = createTokens(user);
        setAuthCookies(res, { accessToken, refreshToken });

        return { success: true };
      }

      return {
        success: false,
        errors: [{ field: "password", message: "Wrong password" }],
      };
    },
    logout: (_, __, { res }) => {
      res.clearCookie("a-token");
      res.clearCookie("r-token");
      return { success: true };
    },
  },
};

const validate = async (input: RegisterInput, prisma: PrismaClient) => {
  if (input.password.length < 6)
    return {
      success: false,
      errors: [
        {
          field: "password",
          message: "Password has to be 6 characters or longer",
        },
      ],
    };

  const testUsername = await prisma.user.findFirst({
    where: {
      username: input.username,
    },
  });
  const testEmail = await prisma.user.findFirst({
    where: {
      email: input.email,
    },
  });

  if (testUsername)
    return {
      success: false,

      errors: [
        {
          field: "username",
          message: "Username already exists",
        },
      ],
    };

  if (testEmail)
    return {
      success: false,
      errors: [
        {
          field: "email",
          message: "Email already exists",
        },
      ],
    };

  return null;
};
