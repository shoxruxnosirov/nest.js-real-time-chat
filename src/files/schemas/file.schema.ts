import { Schema } from 'mongoose';

export const FileSchema = new Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
});