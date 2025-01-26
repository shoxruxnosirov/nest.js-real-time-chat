import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IChat } from './interfaces/chat.interface';
import { ChatDto } from './dto/chat.dto';
import { resourceUsage } from 'process';
import { IAccount } from 'src/users/interfaces/account.interface';

@Injectable()
export class ChatsService {
    constructor(
      @InjectModel("Chats") private readonly chatModel: Model<IChat>
      // @InjectModel('Account')
    ) {}

    async create(chatDto: ChatDto): Promise<IChat> {
      // console.log("create chatDto: ", chatDto);
        const createdFile = new this.chatModel(chatDto);
        return createdFile.save();
      }
    
      async findAll(): Promise<IChat[]> {
        return this.chatModel.find().exec();
      }

      async editUsername(data: { id: string, username: string}) {
        const chat = await this.chatModel.findById(data.id);
        chat.username = data.username;
        return chat.save();
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

      async getChatAccIds(id: string | Types.ObjectId, editedField: string): Promise<{lichChatAccIds: Types.ObjectId[], allChatAccIds?: Types.ObjectId[]}> {
        try {
          if(editedField === 'name') {
            const chats = await this.chatModel.find({
              participant_ids: {$in: [id]},
            }).exec();
            const setChatIds: Set<Types.ObjectId> = new Set<Types.ObjectId>();
            const lichChatAccIds: Types.ObjectId[] = [];
            chats.forEach(chat => {
              chat.participant_ids.forEach(id => {
                setChatIds.add(id);
              });
              if(chat.type == 'lich') {
                lichChatAccIds.push(chat.participant_ids.find(accId => accId.toString() !== id.toString()));
              }
            });
            return {
              lichChatAccIds,
              allChatAccIds: Array.from(setChatIds)
            }
          } else {
            const chats = await this.chatModel.find({
              participant_ids: {$in: [id]},
              type: "lich"
            }).exec();

            return {
              lichChatAccIds: chats.map(chat => chat.participant_ids.find(accId => accId.toString() !== id.toString()))
            }
          }
        }
        catch(err) {
          console.log(err);
        }
      }

      async findUserChats(id: string | Types.ObjectId): Promise<IChat[]> {
        try {
          return this.chatModel.find({participant_ids: {$in: [new Types.ObjectId(id)]}}).exec();
        } 
        catch(err) {
          console.log(err);
        }
      }

      async isGroupnameExists(username: string): Promise<boolean> {
        try {
          return !!(await this.chatModel.findOne({ username }).exec());
        } 
        catch(err) {
          console.log(err);
        }
      } 

      async addUserToGroup (data: {id: string, newMemberId: string}) {
        const group = await this.chatModel.findById(data.id);
        if (!group) {
          throw new NotFoundException(`User with ID ${data.id} not found`);
        }

        group.participant_ids.push(new Types.ObjectId(data.newMemberId));
        group.removeMessage.push(false);
        group.changeGroupData.push(false);

        return group.save();
      }

      // async searchGroupName (username: string): Promise<IChat[]> {
      //   const groups = await this.chatModel.find();
      //   // return accounts.filter(acc => acc.id.startsWith(id));
      //   return groups.filter(gr => gr.username?.toLocaleLowerCase().startsWith(username.toLocaleLowerCase()));
      // }

      async searchGroupName(username: string): Promise<IChat[]> {
        const groups = await this.chatModel.find({
          username: { $regex: new RegExp(`^${username}`, 'i') } // 'i' flag for case-insensitive matching
        });
        return groups;
      }

      async editProfile(data: { id: string, editedField: string, data: any}) {
        const chat = await this.chatModel.findById(data.id);
        // if(data.editedField === 'name') {
        //     chat.name = data.data.name;
        // } else {
        // console.log("chat: ", chat);
          chat[data.editedField] = data.data;
        // }
        return chat.save();
    }

    async getById(id: Types.ObjectId): Promise<IChat> {
        return this.chatModel.findById(id);
    }
    async addMembersToGroup(data: {participant_ids: string[], chatId: string}): Promise<IChat> {
      const chat = await this.chatModel.findById(new Types.ObjectId(data.chatId));
      data.participant_ids.forEach(accId => {
        chat.participant_ids.push(new Types.ObjectId(accId));
        chat.changeGroupData.push(false);
        chat.removeMessage.push(false);
      });
      return chat.save();
    }

    async getGroupMembers(chatId: Types.ObjectId): Promise<{ members: IAccount[], chatData: IChat }> {
      const [chatData] = await this.chatModel.aggregate([
        {
          $match: { _id: chatId }
        },
        {
            $lookup: {
                from: 'accounts',
                localField: 'participant_ids',
                foreignField: '_id',
                as: 'members'
            }
        }
      ]);
      
      if (!chatData) {
          throw new NotFoundException('Chat not found');
      }
      const members = chatData.members;
      delete chatData.members;
    
      return {
          chatData,
          members
      };
    }
    
}
