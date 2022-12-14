import {  IsNotEmpty, IsEmail } from "class-validator";


export class InputEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string
}

