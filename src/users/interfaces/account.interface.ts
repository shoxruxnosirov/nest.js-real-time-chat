import { Document } from "mongoose";

export interface IAccount extends Document {
    readonly id: string;
    readonly user: string;
    readonly email: string;
    readonly password: string;
}