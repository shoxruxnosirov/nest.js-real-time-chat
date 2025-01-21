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
// import { ConfigModule } from '@nestjs/config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [  
    ConfigModule.forRoot({
      isGlobal: true, // Konfiguratsiyani global qilish
    }),
    // ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // 'public' papkasidan fayllar uzatiladi
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false, // index.html faylini qidirmasin
      },
    }),
    // JwtModule.register({
    //   secret: 'yourSecretKey', // Sizning maxfiy kalitingiz
    //   // signOptions: { expiresIn: '1h' }, // Token muddati
    // }),
    JwtModule.registerAsync({
      imports: [ConfigModule], // ConfigModule ni import qilish
      inject: [ConfigService], // ConfigService'ni inject qilish
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // .env fayldan JWT_SECRET
        // signOptions: {
        //   expiresIn: configService.get<string>('JWT_EXPIRES_IN', '3600s'), // Amal qilish muddati
        // },
      }),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/nestauth'),
    UsersModule,
    FilesModule,
    MessagesModule,
    ChatsModule,
    ChatModule
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
        // { path: 'uploads/*', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST }, 
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/google', method: RequestMethod.GET },
        { path: 'auth/google/callback', method: RequestMethod.GET },
        { path: 'chat', method: RequestMethod.GET } 
      )
      .forRoutes('*');
  }
}
