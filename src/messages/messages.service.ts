import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async editName(data: {sender_id:string, data: {name: string, lastName: string}}) {
    const result = await this.messageModel.updateMany(
      { sender_id: data.sender_id }, 
      { $set: { senderName: data.data.name  } },
    );
    return result.modifiedCount;
  }

   // 1. Eng oxirgi xabarni olish
  //  async getLatestMessage(chatId: string | Types.ObjectId):Promise<IMessage[]> {
  //   return this.messageModel
  //   .find({ chatId: chatId })
  //   .sort({ _id: -1 })
  //   .limit(1)
  //   .exec();
  // }

  // // 2. Oldingi 100 ta xabarni olish
  // async getPreviousMessages(chatId: string, lastId: string, limit: number = 100) {
  //   return await this.messageModel
  //     .find({ chatId: chatId, _id: { $lt: lastId } })  
  //     .sort({ _id: -1 }) 
  //     .limit(limit) 
  //     .exec();
  // }

  async getPreviousMessagesWithAggregation(chatId: string, lastId: string | null, limit: number = 100) {
    return await this.messageModel.aggregate([
      {
        $match: typeof(lastId) === "string" ? {
          chatId: new Types.ObjectId(chatId),
          _id: { $lt: new Types.ObjectId(lastId) },
        } : 
        {
          chatId: new Types.ObjectId(chatId)
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'messages', 
          localField: 'replying_for_Ms_Id',
          foreignField: '_id',
          as: 'replying_for_Ms',
        },
      },
      {
        $addFields: {
          replying_for_Ms: { $arrayElemAt: ['$replying_for_Ms', 0] },
        },
      },
      {
        $project: {
          message: '$$ROOT',
          replying_for_Ms: 1,
          _id: 0
        },
      },
    ]).exec();
  }
  

  // Get all messages by chatId
  async findAllByChatId(chatId: string | Types.ObjectId): Promise<IMessage[]> {
    return this.messageModel.find({ chatId }).exec();
  }
  
  async findAllReplyMessages(replying_for_Ms_Id: string | Types.ObjectId): Promise<IMessage[]> {
    return this.messageModel.find({replying_for_Ms_Id}).exec();
  }

  // Get a specific message by message_id
  async findOneByMessageId(_id: string | Types.ObjectId): Promise<IMessage> {
    return this.messageModel.findById(_id).exec();
  }

  // Update a message by message_id
  async updateMessage(_id: string | Types.ObjectId, content: string): Promise<IMessage> {
    const message = await this.messageModel.findById(_id).exec();
    if (!message) { throw new Error('Message not found'); }
    message.content = content;
    return message.save();
  }

  // Delete a message by message_id
  async deleteMessage(_id: string | Types.ObjectId): Promise<any> {
    return this.messageModel.findByIdAndDelete(_id).exec();
  }
  
}

