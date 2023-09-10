import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateAdminDto {

    @IsOptional()
    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    username: string;

    @IsOptional()
    @IsEmail()
    email: string;

}
