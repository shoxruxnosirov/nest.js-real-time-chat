import mongoose, { Schema } from 'mongoose';
import { IChat } from '../interfaces/chat.interface';

// export const GroupSchema = new Schema<IAdmin>({
//   changeGroupData: { type: Boolean, default: true, required: false},
//   removeMessage: { type: Boolean, default: false,  required: false },
// });

export const ChatSchema = new Schema<IChat>({
  type: { type: String, required: true },
  participant_ids: { type: [String], required: false},
  chatname: { type: String, required: false},
    changeGroupData: { type: [Boolean], required: false },
    removeMessage: { type: [Boolean], required: false }
});