import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
// import { Message, MessageDocument } from './schemas/messages.schema';
import { MessageDto } from './dto/message.dto';
import { IMessage } from './interfaces/message.interface';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel("Message") private messageModel: Model<IMessage>,
    
  ) {}

  // Create a new message
  async create(MessageDto: MessageDto): Promise<IMessage> {
    const newMessage = new this.messageModel(MessageDto);
    return newMessage.save();
  }

  // Get all messages by chat_id
  async findAllByChatId(chat_id: string | Types.ObjectId): Promise<IMessage[]> {
    return this.messageModel.find({ chat_id }).exec();
  }

  // Get a specific message by message_id
  async findOneByMessageId(_id: string | Types.ObjectId): Promise<IMessage> {
    return this.messageModel.findById(_id).exec();
  }

  // Update a message by message_id
  async updateMessage(_id: string | Types.ObjectId, updateMessageDto: MessageDto): Promise<IMessage> {
    return this.messageModel.findOneAndUpdate({ _id }, updateMessageDto, { new: true }).exec();
  }

  // Delete a message by message_id
  async deleteMessage(_id: string | Types.ObjectId): Promise<any> {
    return this.messageModel.findByIdAndDelete(_id).exec();
  }
  
}

