import { Schema } from 'mongoose';
// import { timestamp } from 'rxjs';

export const MessageSchema = new Schema({
  chat_id: { type: Schema.Types.ObjectId, ref: 'Chats', required: true },
  sender_id: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  replying_for_Ms_Id: { type: Schema.Types.ObjectId, ref: 'Message', required: false },
  // receiver_id: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
});




// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// export type MessageDocument = Message & Document;

// @Schema()
//  export class Message {
//   @Prop({ required: true })
//   id: string;

//   @Prop({ required: true })
//   chat_id: string;

//   @Prop({ required: true })
//   sender_id: string;

//   // @Prop({ required: true })
//   // receiver_id: string;

//   @Prop({ required: true })
//   content: string;

//   @Prop({ required: true })
//   timestamp: Date;
// }

// export const MessageSchema = SchemaFactory.createForClass(Message);
