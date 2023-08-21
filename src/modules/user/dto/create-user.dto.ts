import { IsString, IsEmail, IsMongoId, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ObjectId } from 'mongoose';

class BookedFlat {
  @IsMongoId()
  propertId: ObjectId;

  @IsString()
  flatNumber: string;
}

export class CreateUserDto {
  @IsMongoId()
  adminId: ObjectId;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookedFlat)
  bookedFlats: BookedFlat[];
}
