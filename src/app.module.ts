import { Module, MiddlewareConsumer, NestModule, RequestMethod   } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from './jwt.middleware';
import { FilesModule } from './files/files.module';


@Module({
  imports: [ 
    MongooseModule.forRoot('mongodb://localhost:27017/nestauth'),
    UsersModule, 
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware) 
      .exclude(
        { path: 'auth/signup', method: RequestMethod.POST }, // signup marshrutini exclude qilish
        { path: 'auth/login', method: RequestMethod.POST },  // login marshrutini exclude qilish
      )
      .forRoutes('*');
  }
}
