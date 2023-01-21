import { prop, getModelForClass } from "@typegoose/typegoose";
import { Field, ID, ObjectType } from "type-graphql"
import { Schema } from "mongoose";
import { User, UserModel } from "../schema/user.schema";

@ObjectType()
export class Challenge {

    @Field(returns => ID)
    readonly _id: Schema.Types.ObjectId;

    @Field(returns => String)
    @prop({required: true})
    idUser1: String

    @Field(returns => String)
    @prop({required: true})
    idUser2: String

    @Field(returns => Date)
    @prop()
    createdAt: Date

    @Field(returns => Boolean)
    @prop()
    resolved: Boolean

    @Field(returns => User)
    @prop()
    user1: User

    @Field(returns => User)
    @prop()
    user2: User 
  
    constructor(id1:String, id2: String, user1: User, user2: User){
        this.idUser1 = id1
        this.idUser2 = id2
        this.createdAt = new Date(Date.now())
        this.resolved = false
        this.user1 = user1
        this.user2 = user2
    }
    
}

export const ChallengeModel = getModelForClass<typeof Challenge>(Challenge)
