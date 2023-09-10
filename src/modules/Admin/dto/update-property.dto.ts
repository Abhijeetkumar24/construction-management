import { ObjectId } from "mongoose";
import { IsString, IsEnum, IsArray, ArrayNotEmpty, IsNumber, IsMongoId, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class FlatDto {

    @IsOptional()
    @IsString()
    flatNumber: string;
    
    @IsOptional()
    @IsMongoId()
    bookedBy: ObjectId;

    @IsOptional()
    @IsString()
    status: string;
}

class MaterialCostDto {

    @IsOptional()
    @IsString()
    material: string;

    @IsOptional()
    @IsNumber()
    cost: number;
}


export class UpdatePropertyDto {

    @IsOptional()
    @IsString()
    location: string;

    @IsOptional()
    @IsEnum(['commercial', 'residential'])
    type: string;

    @IsOptional()
    @IsString()
    specifications: string;

    @IsOptional()
    @IsEnum(['completed', 'under-construction'])
    status: string;

    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    workers?: ObjectId[];

    @IsOptional()   
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FlatDto)
    flats: FlatDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MaterialCostDto)
    materialCost: MaterialCostDto[];
}