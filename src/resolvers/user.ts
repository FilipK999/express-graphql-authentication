import { CreateUserInput, Resolvers } from "../schema/schema";
import argon2 from "argon2";
import { PrismaClient } from ".prisma/client";

export const userResolvers: Resolvers = {
  Mutation: {
    createUser: async (_, args, { prisma }) => {
      const validation = await validate(args.input, prisma);

      if (validation) return validation;

      const hash = await argon2.hash(args.input.password);

      await prisma.user.create({
        data: {
          email: args.input.email,
          username: args.input.username,
          password: hash,
          created: Date.now().toString(),
          updated: Date.now().toString(),
        },
      });

      return {
        success: true,
      };
    },
    login: async (_, args, { prisma }) => {
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

      if (passwordMatch) return { success: true };

      return {
        success: false,
        errors: [{ field: "password", message: "Wrong password" }],
      };
    },
  },
};

const validate = async (input: CreateUserInput, prisma: PrismaClient) => {
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
