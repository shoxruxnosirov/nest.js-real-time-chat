import { Schema } from "mongoose";

export const SeansSchema = new Schema ({
    token: {type: String, required: true},
    account_id: {type: String, required: true}
});