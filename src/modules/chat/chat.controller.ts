
import { AuthGuard } from '../../guards/auth.guard';
import { MessageDto } from './dto/message.dto';
import { ChatsService } from './chat.service';
import { Body, Controller, Post, Req, UseGuards, Get, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Chats')
@ApiBearerAuth() 
@UseGuards(AuthGuard)
@Controller('chats')
export class ChatsController {

    private readonly logger = new Logger('ChatController');
    
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
