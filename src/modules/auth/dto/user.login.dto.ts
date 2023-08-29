import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserLoginDto {


    @IsEmail()
    email: string;

    @IsString()
    password: string;

   
}
