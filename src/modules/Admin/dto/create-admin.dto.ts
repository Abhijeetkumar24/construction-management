import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateAdminDto {
    
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    secret: string;

    @IsOptional()
    @IsString()
    token: string
}
