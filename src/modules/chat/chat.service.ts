import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './schema/message.schema';
import { Model } from 'mongoose';

@Injectable()

export class ChatService {

    constructor(@InjectModel(Message.name) private readonly messageModel: Model<Message>,){}
    async sendMessage(CreateMessageDto: CreateMessageDto, senderId: string): Promise<any> {
        const { receiverId, message } = CreateMessageDto;
        const createMessage = new this.messageModel({
            senderId,
            receiverId,
            message
        });

        return createMessage.save();

    }
}
