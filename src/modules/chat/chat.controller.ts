
import { AuthGuard } from '../../guards/auth.guard';
import { MessageDto } from './dto/message.dto';
import { ChatsService } from './chat.service';
import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('chats')
export class ChatsController {
    constructor(private chatsService: ChatsService) {}

    
    @Post() 
    async createMessage(@Body() message: MessageDto, @Req() request: Request) {
        const userId = request['user'].sub;
        return this.chatsService.createMessage(message, userId)
    }

    
    @Get() 
    async getAllMessages() {
        return this.chatsService.getAllMessages()
    }
}
