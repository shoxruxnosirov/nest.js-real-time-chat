import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileSchema } from './schemas/file.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'File', schema: FileSchema }]), // Mongoose modelini qo'shish
  ],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
