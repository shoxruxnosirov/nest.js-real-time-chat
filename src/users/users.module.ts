import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';  
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsSchema, SeansSchema } from './schemas/accounts.schema';
import { ChatsModule } from '../chats/chats.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { HttpModule } from '@nestjs/axios';
// import { AppModule } from 'src/app.module';
import { forwardRef } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountsSchema }]),
    MongooseModule.forFeature([{ name: 'Sean', schema: SeansSchema }]),
    // ChatsModule,
    forwardRef(() => ChatsModule),
    // AppModule,
    PassportModule.register({ defaultStrategy: 'google' }),
    // JwtModule.register({
    //   secret: 'yourSecretKey',
    //   // signOptions: { expiresIn: '1h' }, 
    // }),
    // JWT moduli dinamik konfiguratsiya bilan
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
    PassportModule,
    HttpModule,
  ],
  providers: [UsersService, GoogleStrategy, AppService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {}
