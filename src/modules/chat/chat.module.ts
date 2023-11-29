import { Module } from '@nestjs/common';
import { ChatsController } from './chat.controller';
import { ChatsService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../../schemas/message.schema';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
    ]),

    AuthModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatGateway]
})
export class ChatModule { }
