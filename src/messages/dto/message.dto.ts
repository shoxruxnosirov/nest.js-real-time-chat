import { Types } from "mongoose";

export class MessageDto {
    readonly chat_id: Types.ObjectId;
    readonly sender_id: Types.ObjectId;
    // readonly receiver_id: string;
    content: string;
    readonly timestamp: Date;
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

