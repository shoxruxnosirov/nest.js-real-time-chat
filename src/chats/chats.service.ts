import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IChat } from './interfaces/chat.interface';
import { ChatDto } from './dto/chat.dto';
import { resourceUsage } from 'process';

@Injectable()
export class ChatsService {
    constructor(@InjectModel("Chats") private readonly chatModel: Model<IChat>) {}

    async create(chatDto: ChatDto): Promise<IChat> {
      // console.log("create chatDto: ", chatDto);
        const createdFile = new this.chatModel(chatDto);
        return createdFile.save();
      }
    
      async findAll(): Promise<IChat[]> {
        return this.chatModel.find().exec();
      }
    
      async findOne(id: string | Types.ObjectId): Promise<IChat> {
        return this.chatModel.findById(id).exec();
      }
    
      async update(id: string | Types.ObjectId, chatDto: ChatDto): Promise<IChat> {
        return this.chatModel.findByIdAndUpdate(id, chatDto, { new: true }).exec();
      }
    
      async delete(id: string | Types.ObjectId): Promise<any> {
        return this.chatModel.findByIdAndDelete(id).exec();
      }

      async findUserChats(id: string | Types.ObjectId): Promise<IChat[]> {
        try {
          return this.chatModel.find({
            participant_ids: {$in: id}
          }).exec();
          // const allRooms = await this.chatModel.find();
          // const rooms = allRooms.filter(item => {
          //   console.log("id: ", id, "\nparticipant_ids: ", item.participant_ids);
          //   return item.participant_ids.includes(id);
          // });
          // return rooms;
        } 
        catch(err) {
          console.log(err);
        }
      }
}
