import { ApolloServer } from "apollo-server-express";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { join } from "path";
const express = require("express");
const app = express();
const port = 4000;

const schema = loadSchemaSync(join(__dirname, "schema/schema.graphql"), {
  loaders: [new GraphQLFileLoader()],
});

const apolloServer = new ApolloServer({
  schema: schema,
  context: ({ req, res }) => ({
    req,
    res,
  }),
});

apolloServer.applyMiddleware({ app, cors: false });

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
