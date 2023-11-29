import { IsDate, IsEnum, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class AddAttendanceDto {

    @IsString()
    propertyId: ObjectId;

    @IsString()
    date: Date;

    @IsEnum(['present', 'absent'])
    status: string;
}