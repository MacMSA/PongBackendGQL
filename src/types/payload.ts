import { Field, ObjectType } from "type-graphql"
import jwt from "jsonwebtoken";
import config from "config"

const expiresIn: string = config.get<string>("JWT_EXPIRES")
const secret: string = config.get<string>("JWT_SECRET")

@ObjectType()
export class AuthPayLoad {
    @Field()
    token: string

    private createJWT = (payload: string | object | Buffer ) => {
        return jwt.sign(payload, secret, {
          expiresIn: expiresIn
        })
      }
      constructor(payload: string | object | Buffer){
        this.token = this.createJWT(payload);
      }
}