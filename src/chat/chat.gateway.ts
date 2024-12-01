import { WebSocketGateway, WebSocketServer, WsResponse, SubscribeMessage, MessageBody, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { IChat } from 'src/chats/interfaces/chat.interface';
import { ChatsService } from 'src/chats/chats.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';
import { IAccount } from 'src/users/interfaces/account.interface';
import { MessageDto } from 'src/messages/dto/message.dto';
import { IMessage, IMessageWithReply } from 'src/messages/interfaces/message.interface';


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
    // console.log(`Client connected: ${client.id}`);
    const accountId: string = client.handshake.headers['customaccountid'].toString();
    const chats: IChat[] = await this.chatService.findUserChats(accountId);

    const chats2: {chat: IChat, userId: Types.ObjectId}[] = chats.map((chat: IChat): {chat: IChat, userId: Types.ObjectId} => {
      const userId = chat.participant_ids.find(accId => accId.toString() !== accountId);
      // if(this.accountAndSocketArr.has(accountId)) {
        this.accountAndSocketArr.get(userId.toString())?.forEach(socketId => {
          this.sockets.get(socketId).emit("userStatus", { chatId: chat.id, status: "online" });
        });
      // }
      return {chat, userId };
    });
    
    const chats3: {chat: IChat, user: IAccount, messages: IMessageWithReply[], status: boolean } [] = [];

    const chats2_lang: number = chats2.length;
    for (let i = 0; i < chats2_lang; i++) {
      const messages: IMessage[] = await this.messagesService.findAllByChatId(chats2[i].chat.id);
      // console.log("messages: ", messages);
      const messagesWithReplys: IMessageWithReply[] = [];
      const messages_lenght = messages.length;
      for (let j = 0; j < messages_lenght; j++) {
        if(messages[j].replying_for_Ms_Id) {
          const replyMessage = await this.messagesService.findOneByMessageId(messages[j].replying_for_Ms_Id);
          console.log("replyMessage: ", replyMessage);
          if(!replyMessage) {
            const messagesWithReply: IMessageWithReply = messages[j];
            messagesWithReplys.push(messagesWithReply);
          } 
          else {
            const replyContent = replyMessage.content;
            const replySender_id = replyMessage.sender_id;
            // const messagesWithReply: IMessageWithReply = {...messages[j], replyContent};
            const {chat_id, content, sender_id, timestamp, _id, replying_for_Ms_Id} = messages[j];
            messagesWithReplys.push({chat_id, content, sender_id, timestamp, _id, replying_for_Ms_Id, replySender_id, replyContent} as IMessageWithReply);
          }
        } else {
          const messagesWithReply: IMessageWithReply = messages[j];
          messagesWithReplys.push(messagesWithReply);
        }
      }

      // console.log("messages: ", messagesWithReplys);
      chats3[i] = { 
        chat: chats2[i].chat,
        user: await this.userService.getById(chats2[i].userId),
        messages: messagesWithReplys, //await this.messagesService.findAllByChatId(chats2[i].chat.id),
        status: this.accountAndSocketArr.has(chats2[i].userId.toString())
      };
    }
    const ownerUser = await this.userService.getById(new Types.ObjectId(accountId));
    // console.log("takeAllData chats: ", chats3);
    client.emit( "takeAllData", {chats: chats3, ownerUser});

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
    // console.log(`Client disconnected: ${client.id}`);
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
            const userId = chat.participant_ids.find(accId => accId.toString() !== accountId);
              this.accountAndSocketArr.get(userId.toString())?.forEach(socketId => {
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
    let existChat: IChat = availableChats.find(chat => chat.type === "lich" && chat.participant_ids.includes(new Types.ObjectId(data.searchUserId)));
    // let existChat: IChat = availableChats.find(chat => chat.type === "lich" && this.includes(chat.participant_ids, new Types.ObjectId(data.searchUserId)));
    if(!existChat) {
      existChat = await (await this.chatService.create({ type: "lich", participant_ids: [new Types.ObjectId(data.clientAccId), new Types.ObjectId(data.searchUserId)]})).save();
      console.log("yangi chat hosil qilindi: ", existChat);
    
      const searchUserStatus = this.accountAndSocketArr.get(data.searchUserId)?.length > 0;
      // console.log("searchUserStatus: ", searchUserStatus);
      const userSearchUser: IAccount = await this.userService.getById(new Types.ObjectId(data.searchUserId));
      
      this.accountAndSocketArr.get(data.clientAccId)?.forEach(socketId => {
        this.sockets.get(socketId).emit("addChatUser", {chat: existChat, user: userSearchUser, messages:[], status: searchUserStatus});
      });
      const userClient: IAccount = await this.userService.getById(new Types.ObjectId(data.clientAccId));
      this.accountAndSocketArr.get(data.searchUserId)?.forEach(socketId => {
        this.sockets.get(socketId).emit("addChatUser", {chat: existChat, user: userClient, messages:[], status: true});
      });
    } 
  }

  @SubscribeMessage('searchUsername')
  async handleSearchId(client: Socket, username: string) {
    const accounts: IAccount[] = await this.userService.searchUsername(username);
    client.emit("searchUsername", accounts);
  }

  @SubscribeMessage('message') 
  async handleMessage(client: Socket, messageObj: {chatId: string, content: string, sender_id: string, replying_for_Ms_Id?: string}) {
    console.log(`Received message from ${client.id}: ${messageObj.content}`);
    // this.server.emit('message', {client: client.id, message});  // Barcha clientlarga xabar yuborish

    let messageDto: MessageDto; 
    if(messageObj.replying_for_Ms_Id) {
      messageDto = {
        chat_id: new Types.ObjectId(messageObj.chatId),
        sender_id: new Types.ObjectId(messageObj.sender_id),
        content: messageObj.content,
        timestamp: new Date(),
        replying_for_Ms_Id: new Types.ObjectId(messageObj.replying_for_Ms_Id)
      };
    } 
    else {
      messageDto = {
        chat_id: new Types.ObjectId(messageObj.chatId),
        sender_id: new Types.ObjectId(messageObj.sender_id),
        content: messageObj.content,
        timestamp: new Date(),
      };
    }
    const replying_for_Ms = messageObj.replying_for_Ms_Id ? await this.messagesService.findOneByMessageId(messageObj.replying_for_Ms_Id) : null; 
    const message = await this.messagesService.create(messageDto);
    // console.log("message: ", message);

    const chat = await this.chatService.findOne(messageObj.chatId);
    chat.participant_ids.forEach( async accountId => {
      const sockets = this.accountAndSocketArr.get(accountId.toString());
      if(sockets) {
        sockets.forEach(socketId => {
          this.sockets.get(socketId).emit("message", { message, replying_for_Ms });
          // this.sockets.get(socketId).emit("message", { writer, message, chatId: messageObj.chatId, reply: messageObj.replying_for_Ms_Id });
        });
      }
    });
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(client: Socket, data: {chatId: string, messageId: string}) {
    // console.log("delete messageId=",data.messageId,"  ", await this.messagesService.findOneByMessageId(data.messageId));
    await this.messagesService.deleteMessage(data.messageId);
    const replyMessages = await this.messagesService.findAllReplyMessages(new Types.ObjectId(data.messageId));
    const chat = await this.chatService.findOne(data.chatId);
    chat.participant_ids.forEach(accountId => {
      this.accountAndSocketArr.get(accountId.toString())?.forEach(socketId => {
        const socket = this.sockets.get(socketId);
        socket.emit("deleteMessage", data);
        replyMessages.forEach(replyMessage => {
          socket.emit("replyMessageDelete", {messageId: replyMessage._id, chatId: data.chatId})
        });
      });
    })
  }

  @SubscribeMessage('editMessage')
  async handleEditMessage(client: Socket, data: {chatId: string, messageId: string, content: string}) {
    // console.log("edit messageId=",data.messageId,"  ", await this.messagesService.findOneByMessageId(data.messageId));
    await this.messagesService.updateMessage(data.messageId, data.content);
    const replyMessages = await this.messagesService.findAllReplyMessages(new Types.ObjectId(data.messageId));
    const chat = await this.chatService.findOne(data.chatId);
    chat.participant_ids.forEach(accountId => {
      this.accountAndSocketArr.get(accountId.toString())?.forEach(socketId => {
        const socket = this.sockets.get(socketId);
        socket.emit("editMessage", data);
        replyMessages.forEach(replyMessage => {
          socket.emit("replyMessageEdit", {messageId: replyMessage._id, chatId: data.chatId, content: data.content});
        });
      });
    })
  }

  // @SubscribeMessage('joinGroup')
  // async joinGroup(@MessageBody() { accountId, chatId }: { accountId: string, chatId: string }, client: Socket) { //: Promise<string> {
  //   const chat = await this.chatService.findOne(chatId);

  //   if (!chat.participant_ids.includes(accountId) && chat.type === "group") {
  //     chat.participant_ids.push(accountId);
  //     await chat.save();
  //   }
  // }

  includes(arrObjId: Types.ObjectId[], objId: Types.ObjectId): boolean {
    const length = arrObjId.length;
    for(let i = 0; i < length; i++) {
      if(arrObjId[i].toString() === objId.toString()) {
        return true;
      }
    }
    return false;
  }
}
