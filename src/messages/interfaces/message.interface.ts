import { Document } from 'mongoose';

export interface IMessage extends Document {
  readonly id: string;
  readonly chat_id: string;
  readonly sender_id: string;
  // readonly receiver_id: string;
  readonly content: string;
  readonly timestamp: Date;
}