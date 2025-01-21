import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  readonly id: string;
  readonly chatId: Types.ObjectId;
  readonly sender_id: Types.ObjectId;
  senderName: string;
  color?: string;
  // readonly receiver_id: string;
  content?: string;
  fileUrl?: string;
  fileId?: Types.ObjectId;
  readonly timestamp: Date;
  readonly replying_for_Ms_Id?: Types.ObjectId;
}

