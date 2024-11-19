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
      return {chat, userId };
    });
    
    const chats3: {chat: IChat, user: IAccount} [] = [];

    const chats2_lang:number = chats2.length;
    for (let i = 0; i < chats2_lang; i++) {
      chats3[i] = { chat: chats2[i].chat, user: await this.userService.getById(chats2[i].userId)};
    }
    console.log("takeAllData chats: ", chats3);
    client.emit( "takeAllData", chats3);

    this.sockets.set(client.id, client); 
    if(this.accountAndSocketArr.has(accountId)){
      this.accountAndSocketArr.get(accountId).push(client.id);
    } else {
     this.accountAndSocketArr.set(accountId, [client.id]);
   }
  }



  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('addChatUser')
  async addChatUser(client: Socket, data: {clientAccId: string, searchUserId: string}) {
    const availableChats = await this.chatService.findUserChats(data.clientAccId);
    let existChat: IChat = availableChats.find(chat => chat.type === "lich" && chat.participant_ids.includes(data.searchUserId));
    if(!existChat) {
      existChat = await (await this.chatService.create({ type: "lich", participant_ids: [data.clientAccId, data.searchUserId]})).save();
      console.log("yangi chat hosil qilindi: ", existChat);
    } 
    const userSearchUser = await this.userService.getById(data.searchUserId);
    this.accountAndSocketArr.get(data.clientAccId)?.forEach(socketId => {
      this.sockets.get(socketId).emit("addChatUser", {chat: existChat, user: userSearchUser});
    });
    const userClient = await this.userService.getById(data.clientAccId);
    this.accountAndSocketArr.get(data.searchUserId)?.forEach(socketId => {
      this.sockets.get(socketId).emit("addChatUser", {chat: existChat, user: userClient});
    });
  }

  @SubscribeMessage('searchId')
  async handleSearchId(client: Socket, id: string) {
    const accounts: IAccount[] = await this.userService.searchId(id);
    client.emit("searchId", accounts);
  }


  @SubscribeMessage('findUser')
  handleFindUser(@MessageBody() data: { username: string }, client: Socket): WsResponse<any> {
    // this.users.set(data.username, client.id); // foydalanuvchining socketId'sini saqlash
    return { event: 'userFound', data: `Foydalanuvchi ${data.username} topildi` };
  }

  // Clientdan xabar olish
  @SubscribeMessage('message') //sendMessage
  async handleMessage(client: Socket, messageObj: {chatId: string, message: string, account_id: string}) {
    console.log(`Received message from ${client.id}: ${messageObj.message}`);
    // this.server.emit('message', {client: client.id, message});  // Barcha clientlarga xabar yuborish
    const chat = await this.chatService.findOne(messageObj.chatId);
    console.log(chat);
    const clientAcc: IAccount = await this.userService.getById(messageObj.account_id); //   keraksiz bo'lishi mumkin buuu agar chaqirish krak bulmasa
    chat.participant_ids.forEach( async accountId => {
      const sockets = this.accountAndSocketArr.get(accountId);
      if(sockets) {
        const writer = sockets.includes(client.id);
        sockets.forEach(socketId => {
          this.sockets.get(socketId).emit("message", { client: clientAcc.name, message: messageObj.message, writer, chatId: messageObj.chatId });
        });
      }
    });
  }

  @SubscribeMessage('joinGroup')
  async joinGroup(@MessageBody() { accountId, chatId }: { accountId: string, chatId: string }, client: Socket) {//: Promise<string> {
    // const user = await this.userModel.findById(userId);
    // const group = await this.groupModel.findById(groupId);

    // if (!user || !group) {
    //   return 'User or Group not found';
    // }

    // Foydalanuvchini guruhga qo'shish
    const chat = await this.chatService.findOne(chatId);
    

    if (!chat.participant_ids.includes(accountId) || chat.type === "group") {
      chat.participant_ids.push(accountId);
      await chat.save();
    }

    // Klientni o'ziga xos ID bilan ro'yxatga olish
    // this.users.set(client.id, client);

    // return `Foydalanuvchi ${chat.name} guruhiga qo'shildi`;
  }
}
