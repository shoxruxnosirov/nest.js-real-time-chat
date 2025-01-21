import { Controller, Post, Get, Param, Body, Put, Delete, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/message.dto';
import { IMessage } from './interfaces/message.interface';
import { Types } from 'mongoose';
import { ISendMessage } from 'src/chat/types.interface';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('previous/:chatId')
  async getPreviousMessages(
    @Param('chatId') chatId: string,
    @Query('lastId') lastId: string,
    @Query('limit') limit: number = 100,
  ): Promise<ISendMessage[]> {
    return this.messagesService.getPreviousMessagesWithAggregation(chatId, lastId, +limit);
  }

  @Post()
  async create(@Body() createMessageDto: MessageDto): Promise<IMessage> {
    return this.messagesService.create(createMessageDto);
  }

  @Get('chat/:chatId')
  async findAllByChatId(@Param('chatId') chatId: Types.ObjectId): Promise<IMessage[]> {
    return this.messagesService.findAllByChatId(chatId);
  }

  @Get(':message_id')
  async findOneByMessageId(@Param('message_id') id: string | Types.ObjectId): Promise<IMessage> {
    return this.messagesService.findOneByMessageId(id);
  }

  @Delete(':message_id')
  async delete(@Param('message_id') id: string | Types.ObjectId): Promise<{ deleted: boolean }> {
    return this.messagesService.deleteMessage(id);
  }

}
