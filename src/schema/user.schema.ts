import {pre, prop, getModelForClass} from "@typegoose/typegoose"
import bcrypt from "bcrypt"
import {Field, InputType, ObjectType, ID } from "type-graphql"
import { isEmail, IsEmail, MaxLength, MinLength } from "class-validator";
import { SchemaDefinitionNode } from "graphql";
import { Schema } from "mongoose";


@ObjectType()
@pre<User>("save", async function () {
    if (this.isModified("password")) { 
        console.log("pass modified")
    }
    else{
        console.log('pass not modified')
    }
})
export class User {

    @Field(returns => ID )
    _id: Schema.Types.ObjectId

    @Field(returns => String)
    @prop({required: true})
    firstname: string;

    @Field(returns => String)
    @prop({required: true})
    lastname: string;

    @Field(returns => String)
    @prop({required: true, unique: true})
    username: string;

    @Field(returns => String)
    @prop({required: true})
    password: string;
}


export const UserModel = getModelForClass<typeof User>(User)

