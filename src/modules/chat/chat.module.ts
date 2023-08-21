import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Message.name, schema: MessageSchema },
  ]),
  ],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule { }
