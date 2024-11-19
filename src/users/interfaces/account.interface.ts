import { Document } from "mongoose";

export interface IAccount extends Document {
    readonly id: string;
    name: string;
    username?: string;
    readonly email: string;
    password: string;
}