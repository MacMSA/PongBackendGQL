import "reflect-metadata"
import dotenv from "dotenv"
dotenv.config();
import express from "express"
import {buildSchema} from "type-graphql"
import { ApolloServer } from "apollo-server-express";
import { Context } from "./types/context";
import {
    ApolloServerPluginLandingPageGraphQLPlayground,
    ApolloServerPluginLandingPageProductionDefault,
  } from "apollo-server-core";
import UserResolver from "./resolvers/user.resolver";
import { connectToMongo } from "./utils/connectMongo";


async function bootup() {

    const schema = await buildSchema({
        resolvers: [UserResolver]
        // authChecker,
    })

    const app = express();

    const server = new ApolloServer({
        schema,
        context: (ctx: Context) => {
            console.log(ctx.debug)
        },
        plugins: [
            process.env.NODE_ENV === "production"
              ? ApolloServerPluginLandingPageProductionDefault()
              : ApolloServerPluginLandingPageGraphQLPlayground(),
          ],
    })

    await server.start()

    server.applyMiddleware({app})

    app.listen(4000, () => {console.log(`🚀 Server ready at http://localhost:4000/graphql`)})

    connectToMongo()

}

bootup()


