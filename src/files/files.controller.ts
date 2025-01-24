import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './fileUploadService'



@Controller('files')
export class FilesController {
    constructor(
      private readonly fileUploadService: FileUploadService,
    ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Body('customName') customName: string, 
    ) {
      const fileUrl = await this.fileUploadService.uploadFile(file, customName);
      return {
        url:  fileUrl?.url || fileUrl?.secure_url
      }
        
    }
}


