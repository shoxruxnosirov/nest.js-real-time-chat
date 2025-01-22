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
import { forwardRef } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MongooseModule.forFeature([{ name: 'Account', schema: AccountsSchema }]),
    MongooseModule.forFeature([{ name: 'Sean', schema: SeansSchema }]),
    forwardRef(() => ChatsModule),
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService], 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
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
