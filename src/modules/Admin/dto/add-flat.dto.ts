import { ObjectId } from "mongoose";
import { IsString, IsEnum } from 'class-validator';


export class AddFlatDto {

    @IsString()
    propertyId: ObjectId;

    @IsString()
    flatNumber: string;

    @IsEnum(['booked', 'available'])
    status: string;
}