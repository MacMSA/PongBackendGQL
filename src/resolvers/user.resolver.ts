import { Arg, Ctx, Mutation, Query, Resolver, Authorized } from "type-graphql";
import { User, UserModel } from "../schema/user.schema";
import { Context } from "../types/context";
import { AuthPayLoad } from "../types/payload";
import { Challenge, ChallengeModel } from "../types/challenge";
import {Schema} from "mongoose";

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

        //   console.log(user);
          const payload = new AuthPayLoad({id: user._id})
          return payload
    }

    @Query(returns => AuthPayLoad )
    async login(
        @Arg("username") username: string,
        @Arg("password") password: string,
        @Ctx() context: Context
    ){
        const possibleUser = await UserModel.findOne({username: username})

        console.log(possibleUser)

        if (!possibleUser || !(await possibleUser.checkPasswords(password))){
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
        return context.user
    }

    @Authorized()
    @Mutation(returns => AuthPayLoad)
    async addChallenge(@Ctx() context: Context, @Arg('user2') u2: String){
        let id1 = context.user._id.toString()
        let id2 = u2

        if(id1 === id2){
            return new Error("Can not choose to add challenge against yourself")
        }

        const user1 = await UserModel.findById(id1)
        const user2 = await UserModel.findById(id2)

        if(user1 && user2){

            const existing = await ChallengeModel.findOne({idUser1: id1, idUser2: id2})
            if(existing){
                return new Error("Challenge already created")
            }

            const challenge = new Challenge(id1, id2, user1, user2)
            ChallengeModel.create({
                idUser1: challenge.idUser1,
                idUser2: challenge.idUser2,
                createdAt: challenge.createdAt,
                user1: challenge.user1,
                user2: challenge.user2,
                resolved: challenge.resolved
            })
            return new AuthPayLoad({id: context.user._id})
        }
        else{
            return new Error("No user of these ids")
        }
    }

    @Authorized()
    @Query(returns => Challenge)
    async getOneChallengeForUser(@Ctx() context: Context, @Arg('user2') u2: String){
        let id1 = context.user._id.toString()
        let id2 = u2

        return await this.convertChallenge(id1, id2)
    }

    async convertChallenge(userID1: String, userID2: String){
        let id1 = userID1
        let id2 = userID2

        if(id1 === id2){
            return new Error("Can not find a challenge against yourself")
        }

        const possibleChallenge = await ChallengeModel.findOne({idUser1: id1, idUser2: id2})

        if(!possibleChallenge){
            return new Error("Challenge not created")
        }

        const user1 = await UserModel.findById(possibleChallenge.idUser1)
        const user2 = await UserModel.findById(possibleChallenge.idUser2)

        if(user1 && user2){
            return new Challenge(
                possibleChallenge.idUser1, possibleChallenge.idUser2, user1, user2
            )
        }
        else{
            return new Error("No user of these ids")
        }
    }
    

    @Authorized()
    @Query(returns => [Challenge])
    async getAllChallengeForUser(@Ctx() context: Context){
        let id1 = context.user._id.toString()

        const possibleChallenges = await ChallengeModel.find({$or: [{idUser1: id1}, {idUser2: id1}]})

        if(!possibleChallenges){
            return new Error("No challenges for user")
        }

        const challengesPromise = possibleChallenges.map((challenge)=>{
            return this.convertChallenge(challenge.idUser1, challenge.idUser2)
        })

        return await Promise.all(challengesPromise)
    }
    
}