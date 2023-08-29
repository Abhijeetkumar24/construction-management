import { ObjectId } from "mongoose";
import { IsString, IsEnum, IsArray, ArrayNotEmpty, IsNumber, IsMongoId, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class FlatDto {
    @IsString()
    flatNumber: string;
    
    @IsOptional()
    @IsMongoId()
    bookedBy: ObjectId;

    @IsString()
    status: string;
}

class MaterialCostDto {
    @IsString()
    material: string;

    @IsNumber()
    cost: number;
}


export class CreatePropertyDto {

    @IsString()
    location: string;

    @IsEnum(['commercial', 'residential'])
    type: string;

    @IsString()
    specifications: string;

    @IsEnum(['completed', 'under-construction'])
    status: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    workers?: ObjectId[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FlatDto)
    flats: FlatDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialCostDto)
    materialCost: MaterialCostDto[];
}