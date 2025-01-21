import { Document, Types } from "mongoose";

export interface IAccount extends Document {
    // readonly id: string;
    googleId: string;
    name: string;
    lastName?: string;
    readonly email: string;
    picture?: string;
    username?: string;
    password?: string;
    color?: string;

    accessToken?: string;
    refreshToken?: string;
    jwtToken?: string;
}
export interface ISeanAndAccount extends IAccount {
    account_id: Types.ObjectId,
}

export interface ISean extends Document {
    account_id: Types.ObjectId;
    accessToken?: string;
    refreshToken?: string;
    jwtToken?: string;
}