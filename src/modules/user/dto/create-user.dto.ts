import { IsString, IsEmail, IsMongoId, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

class BookedFlat {
  @IsString()
  propertId: ObjectId;

  @IsString()
  flatNumber: string;
}

export class CreateUserDto {

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookedFlat)
  bookedFlats: BookedFlat[];
}
