import { Module, MiddlewareConsumer, RequestMethod   } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtMiddleware } from './jwt.middleware';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatGateway } from './chat/chat.gateway'
import { MessagesModule } from './messages/messages.module';
import { ChatsModule } from './chats/chats.module';
import { ChatModule } from './chat/chat.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [  
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false, 
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService], 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), 
      }),
    }),
    UsersModule,
    FilesModule,
    MessagesModule,
    ChatsModule,
    ChatModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway,],// JwtService,],
  exports: [AppService]
})
export class AppModule {//implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware) 
      .exclude(
        { path: 'uploads/(.*)', method: RequestMethod.GET },
        // { path: 'view/firebase-messaging-sw.js', method: RequestMethod.GET },
        // { path: 'uploads/*', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST }, 
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/google', method: RequestMethod.GET },
        { path: 'auth/google/callback', method: RequestMethod.GET },
        { path: 'chat', method: RequestMethod.GET },
        { path: '', method: RequestMethod.GET } 
      )
      .forRoutes('*');
  }
}