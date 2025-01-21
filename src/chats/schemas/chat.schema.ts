import mongoose, { Schema, Types } from 'mongoose';
import { IChat } from '../interfaces/chat.interface';

// export const GroupSchema = new Schema<IAdmin>({
//   changeGroupData: { type: Boolean, default: true, required: false},
//   removeMessage: { type: Boolean, default: false,  required: false },
// });

export const ChatSchema = new Schema<IChat>({
  type: { type: String, required: true },
  participant_ids: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  // participant_ids: { type: [Schema.Types.ObjectId], ref: 'Account', required: false},
  // participant_ids: { type: [Types.ObjectId], ref: "Account", required: true },

  name: { type: String, required: false},
  username: { type: String, required: false},
  picture: { type: String, required: false},
  changeGroupData: { type: [Boolean], required: false },
  removeMessage: { type: [Boolean], required: false },
  timestamp: { type: Date, default: Date.now },
});