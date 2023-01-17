import "reflect-metadata"
import dotenv from "dotenv"
dotenv.config();
import express from "express"
import {buildSchema} from "type-graphql"
import { ApolloServer } from "apollo-server-express";
import { Context } from "./types/context";
import config from "config"
import {
    ApolloServerPluginLandingPageGraphQLPlayground,
    ApolloServerPluginLandingPageProductionDefault,
  } from "apollo-server-core";
import UserResolver from "./resolvers/user.resolver";
import { connectToMongo } from "./utils/connectMongo";
import {verify} from "jsonwebtoken"
import { UserModel } from "./schema/user.schema";
import { authChecker } from "./utils/auth";

async function bootup() {

    const schema = await buildSchema({
        resolvers: [UserResolver],
        authChecker,
        emitSchemaFile: {
            path: __dirname + "/schema.gql"
          },
    })

    const app = express();

    const server = new ApolloServer({
      schema,
      context: async ({req}: any, ctx: Context, ) => {
        let context: Context
        if(ctx){
          context = ctx
        }
        else{
          context = {
            debug: "",
            user: null
          }
        }

        const secret: string = config.get<string>("JWT_SECRET")

        if (
          !req.headers.authorization ||
          !req.headers.authorization.split(" ")[1]
        ){
          return context
        }

        // Authorization: Bearer <token>
        const token = req.headers.authorization.split(" ")[1];

        const payload = <{ id: string }>(
          verify(token, secret)
        )
        const user = await UserModel.findById(payload.id);

        context.user = user
        context.debug = payload.id

        // console.log(context)
        
        return context;
      },
      plugins: [
        process.env.NODE_ENV === "production"
          ? ApolloServerPluginLandingPageProductionDefault()
          : ApolloServerPluginLandingPageGraphQLPlayground(),
      ],
    });
    await server.start()

    server.applyMiddleware({app})

    app.listen(4000, () => {console.log(`🚀 Server ready at http://localhost:4000/graphql`)})

    connectToMongo()

}

bootup()


