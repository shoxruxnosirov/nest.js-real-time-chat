export class MessageDto {
    readonly chat_id: string;
    readonly sender_id: string;
    readonly receiver_id: string;
    readonly content: string;
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
