import { ApolloServer } from "apollo-server-express";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { join } from "path";
import resolvers from "./resolvers";
import { Context } from "./types";
import "reflect-metadata";
import { PrismaClient } from "@prisma/client";
import express from "express";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { __prod__ } from "./constants";

const app = express();
const port = 4000;
const prisma = new PrismaClient();

const RedisStore = connectRedis(session);
const redisClient = redis.createClient({
  db: 1,
});
app.use(
  session({
    name: "qid",
    store: new RedisStore({ client: redisClient, disableTouch: true }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      secure: __prod__, //HTTPS
    },
    secret: process.env.REDIS_SECRET ?? "secret",
    resave: false,
    saveUninitialized: false,
  })
);

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
