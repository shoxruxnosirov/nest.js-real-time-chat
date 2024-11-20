import { WebSocketGateway, WebSocketServer, WsResponse, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { sourceMapsEnabled } from 'process';
import { Server, Socket } from 'socket.io';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChat } from 'src/chats/interfaces/chat.interface';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';
import { IAccount } from 'src/users/interfaces/account.interface';
import { MessageDto } from 'src/messages/dto/message.dto';
import { IMessage } from 'src/messages/interfaces/message.interface';
import { Message } from 'src/messages/schemas/messages.schema';


@WebSocketGateway(3001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(
    // @InjectModel('Chats') private chatModel: Model<IChat>,
    private readonly chatService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly userService: UsersService
  ) {}

  private sockets: Map<string, Socket> = new Map();
  private accountAndSocketArr: Map<string, string[]> = new Map();

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const accountId: string = client.handshake.headers['customaccountid'].toString();
    const chats = await this.chatService.findUserChats(accountId);

    const chats2 = chats.map((chat) => {
      const userId = chat.participant_ids.find(accId => accId !== accountId);
      // if(this.accountAndSocketArr.has(accountId)) {
        this.accountAndSocketArr.get(userId)?.forEach(socketId => {
          this.sockets.get(socketId).emit("userStatus", { chatId: chat.id, status: "online" });
        });
      // }
      return {chat, userId };
    });
    
    const chats3: {chat: IChat, user: IAccount, messages: Message[], status: boolean } [] = [];

    const chats2_lang: number = chats2.length;
    for (let i = 0; i < chats2_lang; i++) {
      chats3[i] = { 
        chat: chats2[i].chat,
        user: await this.userService.getById(chats2[i].userId),
        messages: await this.messagesService.findAllByChatId(chats2[i].chat.id),
        status: this.accountAndSocketArr.has(chats2[i].userId)
      };
    }
    console.log("takeAllData chats: ", chats3);
    client.emit( "takeAllData", chats3);

    this.sockets.set(client.id, client); 
    if(this.accountAndSocketArr.has(accountId)){
      this.accountAndSocketArr.get(accountId).push(client.id);
    } else {
     this.accountAndSocketArr.set(accountId, [client.id]);
    //  const chats = await this.chatService.findUserChats(accountId);
    //  chats.forEach(chat => {})
   }
  }



  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.sockets.delete(client.id);
    this.accountAndSocketArr.forEach(async (socketIds: string[], accountId: string) => {

      if(socketIds.includes(client.id)) {
        const socketArr = this.accountAndSocketArr.get(accountId);
        for (let i = socketArr.length - 1; i >= 0; i--) {
          if (socketArr[i] === client.id) {
            socketArr.splice(i, 1);
          }
        }
        if(socketArr.length === 0) {
          const chats = await this.chatService.findUserChats(accountId);
          chats.forEach((chat) => {
            const userId = chat.participant_ids.find(accId => accId !== accountId);
              this.accountAndSocketArr.get(userId)?.forEach(socketId => {
                this.sockets.get(socketId).emit("userStatus", { chatId: chat.id, status: 'offline' });
              });
          });
        }
      }

    })
  }

  @SubscribeMessage('addChatUser')
  async addChatUser(client: Socket, data: {clientAccId: string, searchUserId: string}) {
    const availableChats = await this.chatService.findUserChats(data.clientAccId);
    let existChat: IChat = availableChats.find(chat => chat.type === "lich" && chat.participant_ids.includes(data.searchUserId));
    if(!existChat) {
      existChat = await (await this.chatService.create({ type: "lich", participant_ids: [data.clientAccId, data.searchUserId]})).save();
      console.log("yangi chat hosil qilindi: ", existChat);

      const userSearchUser = await this.userService.getById(data.searchUserId);
      this.accountAndSocketArr.get(data.clientAccId)?.forEach(socketId => {
        this.sockets.get(socketId).emit("addChatUser", {chat: existChat, user: userSearchUser});
      });
      const userClient = await this.userService.getById(data.clientAccId);
      this.accountAndSocketArr.get(data.searchUserId)?.forEach(socketId => {
        this.sockets.get(socketId).emit("addChatUser", {chat: existChat, user: userClient});
      });
    } 
  }

  @SubscribeMessage('searchId')
  async handleSearchId(client: Socket, id: string) {
    const accounts: IAccount[] = await this.userService.searchId(id);
    client.emit("searchId", accounts);
  }

  // Clientdan xabar olish
  @SubscribeMessage('message') //sendMessage
  async handleMessage(client: Socket, messageObj: {chatId: string, message: string, account_id: string}) {
    console.log(`Received message from ${client.id}: ${messageObj.message}`);
    // this.server.emit('message', {client: client.id, message});  // Barcha clientlarga xabar yuborish

    const messageDto: MessageDto = {
      chat_id: messageObj.chatId,
      sender_id: messageObj.account_id,
      content: messageObj.message,
      timestamp: new Date()
    };
    const message = await this.messagesService.create(messageDto);
    console.log("message: ", message);

    const chat = await this.chatService.findOne(messageObj.chatId);
    chat.participant_ids.forEach( async accountId => {
      const sockets = this.accountAndSocketArr.get(accountId);
      if(sockets) {
        const writer = sockets.includes(client.id);
        sockets.forEach(socketId => {
          this.sockets.get(socketId).emit("message", { writer, message: messageObj.message, chatId: messageObj.chatId });
        });
      }
    });
  }

  // @SubscribeMessage('joinGroup')
  // async joinGroup(@MessageBody() { accountId, chatId }: { accountId: string, chatId: string }, client: Socket) { //: Promise<string> {
  //   const chat = await this.chatService.findOne(chatId);

  //   if (!chat.participant_ids.includes(accountId) && chat.type === "group") {
  //     chat.participant_ids.push(accountId);
  //     await chat.save();
  //   }
  // }
}
