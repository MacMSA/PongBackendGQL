import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User, UserModel } from "../schema/user.schema";
import { Context } from "../types/context";
import { AuthPayLoad } from "../types/payload";

@Resolver()
export default class UserResolver {

    @Query(returns => User)
    async me(context: Context){
        return{
            firstname: "Danyal"
        }
    }


    @Mutation(returns => AuthPayLoad)
    async register(
        @Arg("firstname") firstname: string,
        @Arg("lastname") lastname: string,
        @Arg("username") username: string,
        @Arg("password") password: string
    ){

        const user = await UserModel.create({
            username,
            password,
            firstname,
            lastname,
          })

          console.log(user);
          return new AuthPayLoad({id: user._id})
    }

    @Query(returns => AuthPayLoad)
    async login(
        @Arg("username") user: string,
        @Arg("password") pass: string,
    ){

    }

}