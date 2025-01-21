import { Module, forwardRef  } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { ChatSchema } from './schemas/chat.schema';
import { ChatsController } from './chats.controller';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Chats', schema: ChatSchema }]), 
    forwardRef(() => UsersModule),
    // UsersModule,
    forwardRef(() => MessagesModule)
  ],
  providers: [ChatsService ],     
  controllers: [ChatsController],
  exports: [ChatsService],     
})
export class ChatsModule {}
