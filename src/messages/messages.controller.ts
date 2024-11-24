import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/message.dto';
import { IMessage } from './interfaces/message.interface';
import { Types } from 'mongoose';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: MessageDto): Promise<IMessage> {
    return this.messagesService.create(createMessageDto);
  }

  @Get('chat/:chat_id')
  async findAllByChatId(@Param('chat_id') chat_id: Types.ObjectId): Promise<IMessage[]> {
    return this.messagesService.findAllByChatId(chat_id);
  }

  @Get(':message_id')
  async findOneByMessageId(@Param('message_id') id: string | Types.ObjectId): Promise<IMessage> {
    return this.messagesService.findOneByMessageId(id);
  }

  @Put(':message_id')
  async update(
    @Param('message_id') id: string | Types.ObjectId,
    @Body() updateMessageDto: MessageDto,
  ): Promise<IMessage> {
    return this.messagesService.updateMessage(id, updateMessageDto);
  }

  @Delete(':message_id')
  async delete(@Param('message_id') id: string | Types.ObjectId): Promise<{ deleted: boolean }> {
    return this.messagesService.deleteMessage(id);
  }
}
