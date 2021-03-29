import { Resolvers } from "../schema/schema";
import argon2 from "argon2";

export const resolvers: Resolvers = {
  Query: {
    hello: async (_, args, { prisma }) => {
      const allUsers = await prisma.user.findMany();
      console.log(allUsers);

      return {
        message: args.text ?? "fallback",
      };
    },
  },
  Mutation: {
    createUser: async (_, args, { prisma }) => {
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
      console.log(user);
      return user;
    },
    login: async (_, args, { prisma }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: args.input.email,
        },
      });
      const passwordMatch = await argon2.verify(
        user?.password!,
        args.input.password
      );

      if (passwordMatch) {
        return { success: true };
      } else {
        return { success: false, error: "Couldn't log in" }; // TODO
      }
    },
  },
};
