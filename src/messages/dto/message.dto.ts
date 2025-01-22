import { Types } from "mongoose";

export class MessageDto {
    readonly chatId: Types.ObjectId;
    readonly sender_id: Types.ObjectId;
    senderName: string;
    color?:string;
    content?: string;
    fileUrl?: string;
    readonly timestamp: Date;
    readonly replying_for_Ms_Id?: Types.ObjectId;
}
