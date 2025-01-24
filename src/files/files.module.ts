import { forwardRef, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { AppModule } from 'src/app.module'; 
import { FileUploadService } from './fileUploadService'
@Module({
  imports: [
    forwardRef(() => AppModule),
  ],
  controllers: [FilesController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FilesModule {}
