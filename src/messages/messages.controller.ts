import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageDto } from './dto/message.dto';
import { Message } from './schemas/messages.schema';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: MessageDto): Promise<Message> {
    return this.messagesService.create(createMessageDto);
  }

  @Get('chat/:chat_id')
  async findAllByChatId(@Param('chat_id') chat_id: string): Promise<Message[]> {
    return this.messagesService.findAllByChatId(chat_id);
  }

  @Get(':message_id')
  async findOneByMessageId(@Param('message_id') message_id: string): Promise<Message> {
    return this.messagesService.findOneByMessageId(message_id);
  }

  @Put(':message_id')
  async update(
    @Param('message_id') message_id: string,
    @Body() updateMessageDto: MessageDto,
  ): Promise<Message> {
    return this.messagesService.updateMessage(message_id, updateMessageDto);
  }

  @Delete(':message_id')
  async delete(@Param('message_id') message_id: string): Promise<{ deleted: boolean }> {
    return this.messagesService.deleteMessage(message_id);
  }
}
