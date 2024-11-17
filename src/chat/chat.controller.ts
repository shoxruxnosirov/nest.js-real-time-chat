import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('chat')
export class ChatController {
  @Get()
  getIndex(@Res() res: Response) {
    // 'public' papkasidagi 'index.html' faylini uzatish
    res.sendFile(join('D:\nodejs\nest.js\auth\my-nest-project\public', 'index.html'));
  }
}
