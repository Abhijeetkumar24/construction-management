import { IsString } from "class-validator";

export class Verify2faDto {

    @IsString()
    secret: string;

    @IsString()
    token: string;
}