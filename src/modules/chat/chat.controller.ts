import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message-dto';
import { ChatService } from './chat.service';
import { Request } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {

    constructor(private readonly chatService: ChatService){}

    @Post('message')
    async sendMessage(@Body(new ValidationPipe) CreateMessageDto: CreateMessageDto, @Req()request: Request): Promise <any> {
        try {
            const user = request['user'];
            const message = await this.chatService.sendMessage(CreateMessageDto, user.sub);
            return { message: 'Message sent successfully', data: message };
        } catch (error) {
            return { message: 'Failed to send message', error };
        }
    }
}
