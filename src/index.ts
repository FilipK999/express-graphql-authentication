import { ApolloServer } from "apollo-server-express";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { join } from "path";
import resolvers from "./resolvers";
import { Context } from "./types";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import express from "express";
import { __prod__ } from "./constants";
import cookieParser from "cookie-parser";
import { createUserContext } from "./auth";

const app = express();
const port = 4000;
export const prisma = new PrismaClient();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

const schema = loadSchemaSync(join(__dirname, "schema/schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
  resolvers: resolvers,
});

const apolloServer = new ApolloServer({
  schema: schema,
  context: async ({ req, res }): Promise<Context> => {
    const user = await createUserContext(req, res);

    return {
      req,
      res,
      prisma,
      user,
    };
  },
});

apolloServer.applyMiddleware({ app, cors: false });

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
