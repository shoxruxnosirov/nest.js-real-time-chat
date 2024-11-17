import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
// import { ChatSchema, GroupSchema } from './schemas/chat.schema';
import { ChatSchema } from './schemas/chat.schema';
import { ChatsController } from './chats.controller';
// import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Chats', schema: ChatSchema }]), // Mongoose modelini qo'shish
    // MongooseModule.forFeature([{ name: 'Admin', schema: GroupSchema }]), // Mongoose modelini qo'shish

  ],
  providers: [ChatsService ],       // AdminService
  controllers: [ChatsController],
  exports: [ChatsService],          // AdminService
})
export class ChatsModule {}
