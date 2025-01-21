import { forwardRef, Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { AppModule } from 'src/app.module';
@Module({
  imports: [
    // MulterModule.registerAsync({
    //   useClass: FileUploadService,
    // }),
    // AppModule
    forwardRef(() => AppModule),
  ],
  controllers: [FilesController]
})
export class FilesModule {}
