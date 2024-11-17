import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatDto } from './dto/chat.dto';
import { IChat } from './interfaces/chat.interface';

@Controller('chats')
export class ChatsController {

    constructor(private readonly chatService: ChatsService) {}

    @Post()
    async create(@Body() createChatDto: ChatDto): Promise<IChat> {
        return this.chatService.create(createChatDto);
    }

    @Get()
    async findAll(): Promise<IChat[]> {
        return this.chatService.findAll();
    }
}
