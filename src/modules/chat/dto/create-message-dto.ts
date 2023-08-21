import { IsString } from "class-validator";

export class CreateMessageDto{
    
    @IsString()
    receiverId: string;

    @IsString()
    message: string;
}