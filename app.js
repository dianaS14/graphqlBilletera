require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { resolvers } = require("./schemas/resolvers");
const { typeDefs } = require("./schemas/type-defs");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to my api");
});

async function start() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.use((req, res, next) => {
    res.status(404).send("not found");
  });

  app.listen(process.env.PORT || 3000, () =>
    console.log("Server on port", process.env.PORT || 3000)
  );
}

start();
