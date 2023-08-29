import { IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  propertyId: string;

  @IsString()
  price: number;

  @IsString()
  currency: string;
}
