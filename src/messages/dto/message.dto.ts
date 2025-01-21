import { Types } from "mongoose";

export class MessageDto {
    readonly chatId: Types.ObjectId;
    readonly sender_id: Types.ObjectId;
    senderName: string;
    color?:string;
    // readonly receiver_id: string;
    content?: string;
    fileUrl?: string;
    // fileId?: Types.ObjectId;
    readonly timestamp: Date;
    readonly replying_for_Ms_Id?: Types.ObjectId;
}




// import { IsString, IsNotEmpty, IsDate } from 'class-validator';

// export class CreateMessageDto {
//   @IsString()
//   @IsNotEmpty()
//   message_id: string;

//   @IsString()
//   @IsNotEmpty()
//   chat_id: string;

//   @IsString()
//   @IsNotEmpty()
//   sender_id: string;

//   @IsString()
//   @IsNotEmpty()
//   receiver_id: string;

//   @IsString()
//   @IsNotEmpty()
//   content: string;

//   @IsDate()
//   timestamp: Date;
// }

