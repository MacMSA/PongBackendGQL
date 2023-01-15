import {User} from "../schema/user.schema"

export interface Context {
    user: User,
    debug: any
}