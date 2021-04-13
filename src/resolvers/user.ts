import { PrismaClient } from ".prisma/client";
import argon2 from "argon2";
import { __prod__ } from "../utils/constants";
import { LoginInput, RegisterInput, Resolvers } from "../schema/schema";
import { setAuthCookies, createTokens } from "../utils/auth";
import validator from "validator";

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
      const validation = await validateRegistration(args.input, prisma);
      if (validation) return validation;

      const hash = await argon2.hash(args.input.password);

      const user = await prisma.user.create({
        data: {
          email: args.input.email.trim(),
          username: args.input.username,
          password: hash,
          created: Date.now().toString(),
          updated: Date.now().toString(),
        },
      });

      const { accessToken, refreshToken } = createTokens(user);
      setAuthCookies(res, { accessToken, refreshToken });

      return { success: true };
    },

    login: async (_, args, { prisma, res }) => {
      const validation = await validateLogin(args.input, prisma);
      if (validation) return validation;

      const user = await prisma.user.findFirst({
        where: {
          email: args.input.email.trim(),
        },
      });

      const { accessToken, refreshToken } = createTokens(user!);
      setAuthCookies(res, { accessToken, refreshToken });

      return { success: true };
    },

    logout: (_, __, { res }) => {
      res.clearCookie("a-token");
      res.clearCookie("r-token");
      return { success: true };
    },
  },
};

const validateRegistration = async (
  input: RegisterInput,
  prisma: PrismaClient
) => {
  const trimmedEmail = input.email.toLowerCase().trim();
  const trimmedUsername = input.username.trim();

  if (validator.isEmpty(trimmedUsername)) {
    return {
      success: false,
      errors: [
        {
          field: "username",
          message: "This field is required",
        },
      ],
    };
  }

  if (validator.isEmpty(trimmedEmail)) {
    return {
      success: false,
      errors: [
        {
          field: "email",
          message: "This field is required",
        },
      ],
    };
  }

  if (!validator.isEmail(trimmedEmail)) {
    return {
      success: false,
      errors: [
        {
          field: "email",
          message: "Please provide a valid email",
        },
      ],
    };
  }

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

  const usernameExists = await prisma.user.findFirst({
    where: {
      username: input.username,
    },
  });
  const emailExists = await prisma.user.findFirst({
    where: {
      email: input.email,
    },
  });

  if (usernameExists)
    return {
      success: false,

      errors: [
        {
          field: "username",
          message: "Username already exists",
        },
      ],
    };

  if (emailExists)
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

const validateLogin = async (input: LoginInput, prisma: PrismaClient) => {
  const trimmedEmail = input.email.trim();
  const password = input.password;

  if (!validator.isEmail(trimmedEmail)) {
    return {
      success: false,
      errors: [
        {
          field: "email",
          message: "Please provide a valid email",
        },
      ],
    };
  }

  if (validator.isEmpty(trimmedEmail)) {
    return {
      success: false,
      errors: [
        {
          field: "email",
          message: "This field is required",
        },
      ],
    };
  }

  if (validator.isEmpty(password)) {
    return {
      success: false,
      errors: [
        {
          field: "password",
          message: "This field is required",
        },
      ],
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      email: trimmedEmail,
    },
  });

  if (!user) {
    return {
      success: false,
      errors: [
        { field: "email", message: "User with this email doesn't exist" },
      ],
    };
  }

  const passwordMatch = await argon2.verify(user?.password!, input.password);

  if (!passwordMatch) {
    return {
      success: false,
      errors: [{ field: "password", message: "Wrong password" }],
    };
  }
  return null;
};
