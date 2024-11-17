import { Document } from "mongoose";

export interface ISean extends Document {
    readonly id: string;
    readonly token: string;
    readonly account_id: string;
    status?: string;
    last_seen?: Date;
}