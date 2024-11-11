import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';  
import { MongooseModule } from '@nestjs/mongoose';
import { AccountsSchema } from './schemas/accounts.schema';
import { SeansSchema } from './schemas/chats.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Account', schema: AccountsSchema }]),
    MongooseModule.forFeature([{ name: 'Sean', schema: SeansSchema }]),
    JwtModule.register({
      secret: 'yourSecretKey',
      // signOptions: { expiresIn: '1h' }, 
    })
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
