import { IsNotEmpty, IsString } from "class-validator";


export class InputLoginDto {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string

  @IsNotEmpty()
  @IsString()
  password: string
}

