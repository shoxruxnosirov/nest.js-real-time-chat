import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppService } from 'src/app.service';



@Controller('files')
export class FilesController {
    constructor(private readonly appService: AppService) {}

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
          storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
              const uniqueName = `${Date.now()}-${file.originalname}`;
              callback(null, uniqueName);
            },
          }),
        }),
      )
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log("file: ", file);
        return {
            url: `${this.appService.getWebUrl()}:${this.appService.getPort()}/uploads/${file.filename}`,
        }
    }
}


