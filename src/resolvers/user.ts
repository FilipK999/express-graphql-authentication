import { CreateUserInput, Resolvers } from "../schema/schema";
import argon2 from "argon2";
import { PrismaClient } from ".prisma/client";

export const userResolver: Resolvers = {
  Query: {
    me: async (_, __, { req, prisma }) => {
      if (!req.session.userId) return null;

      const user = await prisma.user.findFirst({
        where: {
          id: req.session.userId,
        },
      });
      console.log(user!.id);
      return user;
    },
  },
  Mutation: {
    createUser: async (_, args, { prisma, req }) => {
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

      // automatically log user in
      req.session!.userId = user.id;
      return {
        success: true,
      };
    },

    login: async (_, args, { prisma, req }) => {
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
        // Add user id to session which logs them in
        req.session!.userId = user.id;
        return { success: true };
      }

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
