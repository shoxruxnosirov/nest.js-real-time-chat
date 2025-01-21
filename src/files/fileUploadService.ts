import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory, MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

@Injectable()
export class FileUploadService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    const uploadPath = './uploads';

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, callback) => {
          console.log("file: ", file);
          const uniqueName = `${Date.now()}-${file.originalname}`;
          callback(null, uniqueName);
        },
      }),
    };
  }
}
