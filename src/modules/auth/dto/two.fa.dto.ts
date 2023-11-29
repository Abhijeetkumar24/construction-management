
import { IsEmail, IsEnum, IsString } from 'class-validator';

enum TwoFaType{
    email = 'email',
    googleAuth = 'googleAuth'

}

export class TwoFaDto {

    @IsEmail()
    email: string;
   
    @IsEnum(TwoFaType)
    twoFaType: TwoFaType;
  
}
