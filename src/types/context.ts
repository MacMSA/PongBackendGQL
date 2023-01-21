import { Request, Response } from "express";
import { User } from "../schema/user.schema";

export interface Context {
  debug: string
  user: User | null
}