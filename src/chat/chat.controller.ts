import { Response } from 'express';
import { join } from 'path';
import { Controller, Res, Get, Req } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Get()
    // @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        try {
            const filePath = join(process.cwd(), 'views', 'index.html');
            const htmlContent = await import('fs/promises').then(fs =>
                fs.readFile(filePath, 'utf8'),
            );
            res.send(htmlContent);
        } catch(err) {
            return res.send(err);
        }
    }
}
