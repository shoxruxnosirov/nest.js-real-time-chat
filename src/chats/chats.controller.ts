import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatDto } from './dto/chat.dto';
import { IChat, IUserOrGroupChat } from './interfaces/chat.interface';
import { UsersService } from 'src/users/users.service';
import { IAccount } from 'src/users/interfaces/account.interface';
import { Types } from 'mongoose';
import { ISendMessage } from 'src/chat/types.interface';
import { MessagesService } from 'src/messages/messages.service';

@Controller('chats')
export class ChatsController {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly usersService: UsersService,
        private readonly messagesService: MessagesService
    ) {}

    @Post()
    async create(@Body() createChatDto: ChatDto): Promise<IChat> {
        return this.chatsService.create(createChatDto);
    }

    @Post('members')
    async getGroupMembers(@Body() data: {chatId: string,}): Promise<{members:IAccount[], chatData:IChat}> {
        return this.chatsService.getGroupMembers(new Types.ObjectId(data.chatId));;
    }

    @Post('getAllChat')
    async getAllChat(@Body() data: {accountId: string}): Promise<{chatData: IUserOrGroupChat, lastMessage?: ISendMessage }[]> {
        const chats: IChat[] = await this.chatsService.findUserChats(data.accountId);
        const allChatsAndlastMs: {chatData: IUserOrGroupChat, lastMessages: ISendMessage[] }[] = [];
        const chats_lang: number = chats.length;
        for (let i = 0; i < chats_lang; i++) {
            if(chats[i].type === 'lich') {
                const userId = chats[i].participant_ids.find(accId => accId.toString() !== data.accountId);
                const user = await this.usersService.getById(userId);
                allChatsAndlastMs[i] = {
                    chatData: {
                        type: 'lich',
                        name: user.name,
                        lastName: user.lastName,
                        username: user.username,
                        picture: user.picture,
                        chatId: chats[i]._id as Types.ObjectId,
                        account_id: userId,
                        color: user.color,
                        timestamp: chats[i].timestamp
                    },
                    lastMessages: []
                }
            } else {
                allChatsAndlastMs[i] = {
                    chatData: {
                        type: 'group',
                        name: chats[i].name,
                        username: chats[i].username,
                        picture: chats[i].picture,
                        chatId: chats[i]._id as Types.ObjectId,
                        account_id: chats[i]._id as Types.ObjectId,
                        // participant_ids: chats[i].participant_ids,
                        // changeGroupData: chats[i].changeGroupData,
                        timestamp: chats[i].timestamp,
                        participant_length: chats[i].participant_ids.length
                    },
                    lastMessages: []
                };
            }
            allChatsAndlastMs[i].lastMessages = await this.messagesService.getPreviousMessagesWithAggregation(chats[i]._id.toString(), null, 1);
          
        }
        console.log("allChatsAndlastMs", allChatsAndlastMs);
        return allChatsAndlastMs;
    }

    @Post('createChat_or_joinToGroup')
    async createChat_or_joinToGroup(@Body() data: {type: string, clientAccId: string, searchUserOrGroupId: string}): Promise<{chatData: IUserOrGroupChat, lastMessages: ISendMessage[] }> {
        if(data.type === 'group') {
            const groupData = await this.chatsService.addUserToGroup({id: data.searchUserOrGroupId, newMemberId: data.clientAccId});
            const lastMessages = await this.messagesService.getPreviousMessagesWithAggregation(groupData._id.toString(), null, 1);
            return {
                lastMessages,
                chatData: {
                    type: 'group',
                    name: groupData.name,
                    username: groupData.username,
                    picture: groupData.picture,
                    chatId: groupData._id as Types.ObjectId,
                    account_id: groupData._id as Types.ObjectId,
                    timestamp: groupData.timestamp,
                    participant_ids: groupData.participant_ids,
                    // changeGroupData: chat.changeGroupData
                    participant_length: groupData.participant_ids.length
                }
            }
        } else {
            const chat = await this.chatsService.create({ 
                type: "lich",
                participant_ids: [
                    new Types.ObjectId(data.clientAccId),
                    new Types.ObjectId(data.searchUserOrGroupId)
                ]
            });
            await chat.save();
            const user = await this.usersService.getById(new Types.ObjectId(data.searchUserOrGroupId));
            return {
                lastMessages: [],
                chatData: {
                    type: 'lich',
                    name: user.name,
                    lastName: user.lastName,
                    username: user.username,
                    picture: user.picture,
                    chatId: chat._id as Types.ObjectId,
                    account_id: new Types.ObjectId(data.searchUserOrGroupId),
                    color: user.color,
                    timestamp: chat.timestamp
                }
            }
        }
    }

    @Post('createGroup')
    async createGroup(@Body() chatDTo: ChatDto) : Promise<any> {
        console.log("create Group chatDto: ", chatDTo);
        const newGroup = await this.chatsService.create(chatDTo);
        return {
            participant_ids: newGroup.participant_ids,
            chatData: {
                type: 'group',
                name: newGroup.name,
                username: newGroup.username,
                picture: newGroup.picture,
                chatId: newGroup._id as Types.ObjectId,
                account_id: newGroup._id as Types.ObjectId,
                timestamp: newGroup.timestamp,
                participant_length: newGroup.participant_ids.length
            }
        }
    }

    @Post('addMembersToGroup')
    async addMembersToGroup(@Body() data: {participant_ids: string[], chatId: string}) : Promise<any> {
        const groupData = await this.chatsService.addMembersToGroup(data); 
        return {
            participant_ids: data.participant_ids,
            chatData: {
                type: 'group',
                name: groupData.name,
                username: groupData.username,
                picture: groupData.picture,
                chatId: groupData._id as Types.ObjectId,
                account_id: groupData._id as Types.ObjectId,
                timestamp: groupData.timestamp,
                participant_length: groupData.participant_ids.length
            },
            oldParticipant_ids: groupData.participant_ids
        }
    }

    // @Post('editProfile')
    // async editProfile(@Body() data: { id: string, editedField: string, data: any}): Promise<IChat> {
    //     return this.chatsService.editProfile(data);
    // }
    @Post('editProfile')
    async editProfile(@Body() data: { type: string, accountId: string, editedField: string, data: any}): Promise<{chatData: IUserOrGroupChat, chatAccIds: Types.ObjectId[], allChatAccIds?: Types.ObjectId[]} > {
        if(data.type === 'lich') {
            const user = await this.usersService.editProfile({id: data.accountId, editedField: data.editedField, data: data.data });
            const chatData: IUserOrGroupChat  = {
                type: 'lich',
                name: user.name,
                lastName: user.lastName,
                username: user.username,
                picture: user.picture,
                account_id: user._id as Types.ObjectId,
                color: user.color,
                chatId: user._id as Types.ObjectId,
            }
            const {lichChatAccIds: chatAccIds, allChatAccIds} = await this.chatsService.getChatAccIds(data.accountId, data.editedField);
            if(data.editedField === 'name') {
              console.log('editName: ', await this.messagesService.editName({sender_id: data.accountId, data: data.data}));
            }
            return {chatData, chatAccIds, allChatAccIds}
        } else {
            const groupData = await this.chatsService.editProfile({id: data.accountId, editedField: data.editedField, data: data.data });
            return {
                chatAccIds: groupData.participant_ids,
                chatData: {
                    type: 'group',
                    name: groupData.name,
                    username: groupData.username,
                    picture: groupData.picture,
                    chatId: groupData._id as Types.ObjectId,
                    account_id: groupData._id as Types.ObjectId,
                    // timestamp: groupData.timestamp,
                    // participant_ids: groupData.participant_ids,
                    // changeGroupData: chat.changeGroupData
                    // participant_length: groupData.participant_ids.length
                }
            }
        }
    }
    
    @Post('isUnique')
    async isUniqueUsername(@Body() data: {username: string}): Promise<{isUnique: boolean}> {
        // console.log("data: ", data);
        const isGroupnameExists = await this.chatsService.isGroupnameExists( data.username );
        if(isGroupnameExists) {
            return {isUnique: false};
        }
        const isUsernameExists = await this.usersService.isUsernameExists( data.username );
        // const isUsernameExists = await this.usersService.isEmailExists( data.username );
        return {isUnique: !isUsernameExists};
    }

    @Post('getUserNames')
    async getUsername(@Body() data: {username: string}): Promise<(IAccount | IChat)[]> {
        const accounts: IAccount[] = await this.usersService.searchUsername(data.username);
        const group : IChat[] = await this.chatsService.searchGroupName(data.username);

        return Object.assign(accounts, group);
    }
}
