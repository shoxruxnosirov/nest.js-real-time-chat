import { Module, forwardRef  } from '@nestjs/common';
import { ChatController } from './chat.controller';

@Module({
  imports: [],
  providers: [],     
  controllers: [ChatController],     
})
export class ChatModule {}
