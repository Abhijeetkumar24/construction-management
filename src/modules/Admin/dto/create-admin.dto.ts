import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateAdminDto {
    
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    password: string;

}
