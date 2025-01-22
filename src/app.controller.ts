import { Controller, Res, Get } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  async index(@Res() res: Response) {
    
    const filePath = join(process.cwd(), 'views', 'index_0.html');
    const htmlContent = await import('fs/promises').then(fs =>
        fs.readFile(filePath, 'utf8'),
    );

    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }
}
