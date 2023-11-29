import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateAdminDto {

    @IsString()
    name: string;
    
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

}
