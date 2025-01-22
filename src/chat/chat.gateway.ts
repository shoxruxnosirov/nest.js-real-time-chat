import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { IChat, IUserOrGroupChat } from 'src/chats/interfaces/chat.interface';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';
import { MessageDto } from 'src/messages/dto/message.dto';
import { IMessage } from 'src/messages/interfaces/message.interface';
import { ISendMessage } from './types.interface';


@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly userService: UsersService,
  ) {}

  
  private accountAndSocketArr: Map<string, Socket[]> = new Map();
  private socket_accId_And_sockets: Map<Socket, {accId: string, sockets: Socket[]}> = new Map();

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    const accountId: string = client.handshake.headers['customaccountid'].toString();
    let socketArr: Socket[] = null; 
    if(this.accountAndSocketArr.has(accountId)){
      socketArr = this.accountAndSocketArr.get(accountId);
      socketArr.push(client);
    } else {
      socketArr = [client];
      this.accountAndSocketArr.set(accountId, socketArr);
   }
   this.socket_accId_And_sockets.set(client, {accId: accountId, sockets: socketArr});
  }

  
  @SubscribeMessage('connectedSocket')
  async connectedSocket(client: Socket, data: any) {
    data.allChats.forEach(obj => {
      const chatData = obj.chatData;
      if(chatData.type === 'lich') {
        const sockets = this.accountAndSocketArr.get(chatData.account_id.toString());
        sockets?.forEach(socket => {
          socket.emit("chatStatus", { chatId: chatData.chatId, status: 'online' });
        });
        client.emit("chatStatus", {
          chatId: chatData.chatId,
          status : sockets?.length > 0 ? 'online' : "offline"
        });
      } else {
        client.emit("chatStatus", {
          chatId: chatData.chatId,
          status : chatData.participant_length + " people"
        });
      }
    });
  }

  async handleDisconnect(client: Socket) {
    const {accId: accountId, sockets: socketArr } = this.socket_accId_And_sockets.get(client);
      for (let i = socketArr.length - 1; i >= 0; i--) {
        if (socketArr[i] === client) {
          socketArr.splice(i, 1);
          break;
        }
      }
      if(socketArr.length === 0) {
        const chats = await this.chatService.findUserChats(accountId);
        chats.forEach((chat) => {
          if(chat.type === 'lich') {
            const userId = chat.participant_ids.find(accId => accId.toString() !== accountId);
            this.accountAndSocketArr.get(userId.toString())?.forEach(socket => {
             socket.emit("chatStatus", { chatId: chat.id, status: 'offline' });
            });
          }
        });
      }
  }

  @SubscribeMessage('addChatUser')
  async addChatUser(client: Socket, data: {chatDatas: IUserOrGroupChat[], lastMessages: ISendMessage}) {
    const clientSockets = this.accountAndSocketArr.get(data.chatDatas[1].account_id.toString());
    console.log('addChatUser:', data);
    
    if(data.chatDatas[0].type === 'lich') {
      const searchChatsockets = this.accountAndSocketArr.get(data.chatDatas[0].account_id.toString());
      searchChatsockets?.forEach(socket => {
        socket.emit('addChatUser', data.chatDatas[1], data.lastMessages, 'online');
      });

      clientSockets?.forEach(socket => {
        socket.emit('addChatUser', data.chatDatas[0], data.lastMessages, searchChatsockets?.length > 0 ? 'online' : "offline");
      });

    } else {

      const {participant_ids, ...chatData} = data.chatDatas[0];

      clientSockets?.forEach(socket => {
        socket.emit('addChatUser', chatData, data.lastMessages, chatData.participant_length + " people");
      });

      participant_ids.forEach(accId => {
        this.accountAndSocketArr.get(accId.toString())?.forEach(socket => {
          socket.emit("chatStatus", {
            chatId: chatData.chatId,
            status : chatData.participant_length + " people"
          });
        })
      });
    }
  }

  @SubscribeMessage('message') 
  async handleMessage(client: Socket, messageObj: {chatId: string, content: string, fileUrl?: string, sender_id: string, senderName: string, replying_for_Ms_Id?: string, color: string}) {
    
    let messageDto: MessageDto = {
      chatId: new Types.ObjectId(messageObj.chatId),
      sender_id: new Types.ObjectId(messageObj.sender_id),
      senderName: messageObj.senderName,
      content: messageObj.content,
      color: messageObj.color,
      timestamp: new Date(),
      fileUrl: messageObj.fileUrl,
      replying_for_Ms_Id: messageObj.replying_for_Ms_Id ? new Types.ObjectId(messageObj.replying_for_Ms_Id) : null 
    }; 

    const message: IMessage = await this.messagesService.create(messageDto);

    const replying_for_Ms: IMessage = messageObj.replying_for_Ms_Id ? await this.messagesService.findOneByMessageId(messageObj.replying_for_Ms_Id) : null; 

    const chat: IChat = await this.chatService.findOne(messageObj.chatId);
    chat.participant_ids.forEach( async accountId => {
      const sockets = this.accountAndSocketArr.get(accountId.toString());
      if(sockets) {
        sockets.forEach(socket => {
          socket.emit("message", { message, replying_for_Ms });
        });
      }
    });
  }

  @SubscribeMessage('createGroup')
  async createGroup(client: Socket, data: {participant_ids: string[], chatData: IUserOrGroupChat, oldParticipant_ids?: string[]}) {
    data.participant_ids.forEach(memberId => {
      this.accountAndSocketArr.get(memberId).forEach(socket => {
        socket.emit('addChatUser', data.chatData, [], data.chatData.participant_length + " people");
      });
    });
    data.oldParticipant_ids?.forEach(memberId => {
      this.accountAndSocketArr.get(memberId)?.forEach(socket => {
        socket.emit("chatStatus", { chatId: data.chatData.chatId, status: data.chatData.participant_length + " people" });
       });
    })
  } 

  // @SubscribeMessage('editUsername')
  // async editUsername(client: Socket, data: { type: string, chatId: string, username: string }) {
  //   const chat = await this.chatService.editUsername({id: data.chatId, username: data.username });
  //   chat.participant_ids.forEach(accountId => {
  //     this.accountAndSocketArr.get(accountId.toString())?.forEach(socket => {
  //       socket.emit("editUsername", data);
  //     });
  //   })
  // }

  @SubscribeMessage('editProfile')
  async editProfile(client: Socket, data: {chatData: IUserOrGroupChat, chatAccIds: Types.ObjectId[], allChatAccIds?: Types.ObjectId[]}) {

    data.chatAccIds.forEach(userId => {
      this.accountAndSocketArr.get(userId.toString())?.forEach(async socket => {
        socket.emit("editProfileData", { chatData: data.chatData, type: data.chatData.type });
      });
    });

    if(data.chatData.type === 'lich') {
      this.accountAndSocketArr.get(data.chatData.account_id.toString())?.forEach(socket => {
        socket.emit("editProfile", data.chatData);
      });
      if(data.allChatAccIds?.length > 0) {
        data.allChatAccIds.forEach(userId => {
          this.accountAndSocketArr.get(userId.toString())?.forEach(socket => {
            socket.emit("editProfileName", {name: data.chatData.name, lastName: data.chatData.lastName, account_id: data.chatData.account_id});
          });
        })
      }
    }
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(client: Socket, data: {chatId: string, messageId: string, content: string}) {
    await this.messagesService.updateMessage(data.messageId, data.content);
    const chat = await this.chatService.findOne(data.chatId);
    chat.participant_ids.forEach(accountId => {
      this.accountAndSocketArr.get(accountId.toString())?.forEach(socket => {
        socket.emit("editMessage", data);
      });
    })
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(client: Socket, data: {chatId: string, messageId: string}) {
    await this.messagesService.deleteMessage(data.messageId);
    const chat = await this.chatService.findOne(data.chatId);
    chat.participant_ids.forEach(accountId => {
      this.accountAndSocketArr.get(accountId.toString())?.forEach(socket => {
        socket.emit("deleteMessage", data);
      });
    })
  }

  includes(arrObjId: Types.ObjectId[], objId: Types.ObjectId): boolean {
    const length = arrObjId.length;
    for(let i = 0; i < length; i++) {
      if(arrObjId[i].toString() === objId.toString()) {
        return true;
      }
    }
    return false;
  }

  async getAllMessagesByChatId(chatId: string | Types.ObjectId) {
    const messages: IMessage[] = await this.messagesService.findAllByChatId(chatId);
    const messagesWithReplys: ISendMessage[] = [];
    const messages_lenght = messages.length;
    for (let j = 0; j < messages_lenght; j++) {
      let messagesWithReplysAndFile: ISendMessage = {message: messages[j]}; 
      if(messages[j].replying_for_Ms_Id) {
        const replyMessage = await this.messagesService.findOneByMessageId(messages[j].replying_for_Ms_Id);
        messagesWithReplysAndFile.replying_for_Ms = replyMessage;
      }
      messagesWithReplys.push(messagesWithReplysAndFile);
    }
    return messagesWithReplys;
  }
}
