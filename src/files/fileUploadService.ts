import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory, MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { UploadApiResponse } from 'cloudinary';
import { cloudinary } from './cloudinary.config';

@Injectable()
export class FileUploadService {

  async uploadFile(
    file: Express.Multer.File,
    customName?: string, 
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uniqueFilename = customName
        ? `${customName}-${file.originalname}`
        : `${file.originalname}`;

      cloudinary.uploader.upload_stream(
        { folder: 'nest-app', public_id: uniqueFilename }, 
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer); 
    });
  }

}
