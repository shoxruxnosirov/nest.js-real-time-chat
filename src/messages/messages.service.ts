import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/messages.schema';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Create a new message
  async create(MessageDto: MessageDto): Promise<Message> {
    const newMessage = new this.messageModel(MessageDto);
    return newMessage.save();
  }

  // Get all messages by chat_id
  async findAllByChatId(chat_id: string): Promise<Message[]> {
    return this.messageModel.find({ chat_id }).exec();
  }

  // Get a specific message by message_id
  async findOneByMessageId(message_id: string): Promise<Message> {
    return this.messageModel.findOne({ message_id }).exec();
  }

  // Update a message by message_id
  async updateMessage(message_id: string, updateMessageDto: MessageDto): Promise<Message> {
    return this.messageModel.findOneAndUpdate({ message_id }, updateMessageDto, { new: true }).exec();
  }

  // Delete a message by message_id
  async deleteMessage(message_id: string): Promise<{ deleted: boolean }> {
    const result = await this.messageModel.deleteOne({ message_id }).exec();
    return { deleted: result.deletedCount > 0 };
  }
  
}

