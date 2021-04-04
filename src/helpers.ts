import { prisma } from "./index";
import { User } from "./schema/schema";

export const findUserById = async (userId: number): Promise<User | null> => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  return user;
};
