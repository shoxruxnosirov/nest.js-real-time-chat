import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  readonly id: string;
  readonly chat_id: Types.ObjectId;
  readonly sender_id: Types.ObjectId;
  // readonly receiver_id: string;
  content: string;
  readonly timestamp: Date;
  readonly replying_for_Ms_Id?: Types.ObjectId;
}

export interface IMessageWithReply {
  readonly _id: unknown // Types.ObjectId,
  replyContent?: string;
  readonly id: string;
  readonly chat_id: Types.ObjectId;
  readonly sender_id: Types.ObjectId;
  // readonly receiver_id: string;
  content: string;
  readonly timestamp: Date;
  readonly replying_for_Ms_Id?: Types.ObjectId;
  replySender_id?: Types.ObjectId;
}