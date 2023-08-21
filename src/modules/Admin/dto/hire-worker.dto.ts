import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class HireWorkerDto {
  @IsString()
  workerId: string;

  @IsArray()
  @ArrayNotEmpty()
  skills: string[];
}