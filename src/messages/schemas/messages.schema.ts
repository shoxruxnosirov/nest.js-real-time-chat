import { Schema } from 'mongoose';
// import { timestamp } from 'rxjs';

export const MessageSchema = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chats', required: true },
  sender_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  senderName: { type: String, required: true },
  replying_for_Ms_Id: { type: Schema.Types.ObjectId, ref: 'Message', required: false },
  color: { type: String, required: false },
  content: { type: String, required: false },
  fileUrl: { type: String, required: false },
  timestamp: { type: Date, required: true },
});
