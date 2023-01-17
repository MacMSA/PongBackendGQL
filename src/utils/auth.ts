import {AuthChecker } from "type-graphql"
import { Context } from "../types/context";

export const authChecker: AuthChecker<Context> = ({ context }) : boolean => !!context.user;
