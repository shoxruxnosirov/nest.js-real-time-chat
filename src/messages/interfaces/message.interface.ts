import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  readonly id: string;
  readonly chat_id: Types.ObjectId;
  readonly sender_id: Types.ObjectId;
  // readonly receiver_id: string;
  readonly content: string;
  readonly timestamp: Date;
}