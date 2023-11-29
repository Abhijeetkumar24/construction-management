import { IsString } from 'class-validator';

export class BookFlatDto {
  @IsString()
  propertyId: string;

  @IsString()
  flatNumber: string;

}
