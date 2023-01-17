import { Arg, Ctx, Mutation, Query, Resolver, Authorized } from "type-graphql";
import { User, UserModel } from "../schema/user.schema";
import { Context } from "../types/context";
import { AuthPayLoad } from "../types/payload";

@Resolver()
export default class UserResolver {

    @Mutation(returns => AuthPayLoad)
    async register(
        @Arg("firstname") firstname: string,
        @Arg("lastname") lastname: string,
        @Arg("username") username: string,
        @Arg("password") password: string,
    ){

        const existing = await UserModel.findOne({ username });
        if (existing) throw new Error("User already exists!");

        const user = await UserModel.create({
            username,
            password,
            firstname,
            lastname,
          })

          console.log(user);
          const payload = new AuthPayLoad({id: user._id})
    }

    @Query(returns => AuthPayLoad )
    async login(
        @Arg("username") username: string,
        @Arg("password") password: string,
        @Ctx() context: Context
    ){
        const possibleUser = await UserModel.findOne({username: username})

        if (!possibleUser || possibleUser.password !== password ){
            return new Error("Username or password is incorrect")
        }
        else if(!(await possibleUser.checkPasswords(password))){
            return new Error("Username or password is incorrect")
        }

        return new AuthPayLoad({id: possibleUser._id})
    }

    @Mutation(returns => String)
    async forgotPassword(
        @Arg("username") username: string
    ){
        const user = await UserModel.findOne({ username });

        if (!user) throw new Error("User not found!")

        const token = await user.getPasswordResetToken();

        return token;
    }

    @Authorized()
    @Query(returns => User)
    async me(@Ctx() context: Context){
        return{
            firstname: "Danyal"
        }
    }
    
}