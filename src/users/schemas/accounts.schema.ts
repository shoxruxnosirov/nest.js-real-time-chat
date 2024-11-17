import { Schema } from "mongoose";

export const AccountsSchema = new Schema ({
    name: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    username: {type: String, required: false, unique: true},
    password: {type: String, required: true}
})