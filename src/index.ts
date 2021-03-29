import { ApolloServer } from "apollo-server-express";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { join } from "path";
import resolvers from "./resolvers";
import { Context } from "./types";
import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
const express = require("express");
const app = express();
const port = 4000;
const prisma = new PrismaClient();

const schema = loadSchemaSync(join(__dirname, "schema/schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
  resolvers: resolvers,
});

const apolloServer = new ApolloServer({
  schema: schema,
  context: ({ req, res }): Context => ({
    req,
    res,
    prisma,
  }),
});

apolloServer.applyMiddleware({ app, cors: false });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
