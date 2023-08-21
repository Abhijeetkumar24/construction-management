import { IsString, IsEmail, IsArray, ArrayNotEmpty, IsDateString, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';



export class CreateWorkerDto {

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(['yes', 'no'])
    availability: string;

    @IsArray()
    @ArrayNotEmpty()
    skills: string[];
    

    
}