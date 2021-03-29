// import { Resolvers } from "../schema/schema";
// import argon2 from "argon2";

// export const resolvers: Resolvers = {
//   Query: {
//     hello: async (_, args, { prisma }) => {
//       const allUsers = await prisma.user.findMany();
//       console.log(allUsers);

//       return {
//         message: args.text ?? "fallback",
//       };
//     },
//   },
//   Mutation: {
//     createUser: async (_, args, { prisma }) => {
//       if (args.input.password.length < 6)
//         return {
//           success: false,
//           errors: [
//             {
//               field: "password",
//               message: "Password has to be 6 characters or longer",
//             },
//           ],
//         };

//       const testUsername = await prisma.user.findFirst({
//         where: {
//           username: args.input.username,
//         },
//       });
//       const testEmail = await prisma.user.findFirst({
//         where: {
//           email: args.input.email,
//         },
//       });

//       if (testUsername !== null) {
//         return {
//           success: false,
//           errors: [
//             {
//               field: "username",
//               message: "Username already exists",
//             },
//           ],
//         };
//       } else if (testEmail !== null) {
//         return {
//           success: false,
//           errors: [
//             {
//               field: "email",
//               message: "Email already exists",
//             },
//           ],
//         };
//       }
//       const hash = await argon2.hash(args.input.password);
//       const user = await prisma.user.create({
//         data: {
//           email: args.input.email,
//           username: args.input.username,
//           password: hash,
//           created: Date.now().toString(),
//           updated: Date.now().toString(),
//         },
//       });
//       if (user) return { success: true };
//     },
//     login: async (_, args, { prisma }) => {
//       const user = await prisma.user.findFirst({
//         where: {
//           email: args.input.email,
//         },
//       });
//       const passwordMatch = await argon2.verify(
//         user?.password!,
//         args.input.password
//       );

//       if (passwordMatch) {
//         return { success: true };
//       } else {
//         return {
//           success: false,
//           errors: [{ message: "Wrong password or email" }],
//         };
//       }
//     },
//   },
// };
