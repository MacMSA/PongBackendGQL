import {pre, prop, getModelForClass, DocumentType} from "@typegoose/typegoose"
import {Field, ObjectType, ID } from "type-graphql"
import { IsEmail, MaxLength, MinLength } from "class-validator";
import { Schema } from "mongoose";
import bc from "bcryptjs";
import crypto from "crypto";


@ObjectType()
@pre<User>("save", async function (next) {
    if (!this.isModified("password")) { 
        return next()
    }
    const salt = await bc.genSalt(10);
    this.password = await bc.hash(this.password, salt);

    return next();
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

    @MinLength(6, {
        message: "username must be at least 6 characters long",
      })
    @MaxLength(20, {
        message: "username must not be longer than 50 characters",
      })
    @Field(returns => String)
    @prop({required: true, unique: true })
    username: string;

    @MinLength(6, {
        message: "password must be at least 6 characters long",
      })
    @Field(returns => String)
    @prop({required: true})
    password: string;

    @prop()
    public resetPasswordToken?: string;

    @prop()
    public resetPasswordExpire?: Date;

    // Checks if a given password matches the encrypted password
    public async checkPasswords(this: DocumentType<User>, password: string){
        const valid = await bc.compare(password, this.password);
        return valid;
    }

    // Generates a password reset token and saves an encrypted version to the doc
    public async getPasswordResetToken(this: DocumentType<User>){
        const token = crypto.randomBytes(20).toString("hex");

        this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

        this.resetPasswordExpire = new Date(Date.now() + (10 * (60 * 1000))) // 10 minutes

        await this.save();

        return token;
    }
}

export const UserModel = getModelForClass<typeof User>(User)

