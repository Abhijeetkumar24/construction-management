
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AdminLoginDto {


    @IsEmail()
    email: string;
    
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    emailOtp: string;

    @IsOptional()
    @IsString()
    token: string


}
