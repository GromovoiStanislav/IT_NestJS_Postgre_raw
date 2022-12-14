import { IsString, IsNotEmpty, IsEmail, Length } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class InputUserDto {
  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  login: string

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  password: string

  @IsNotEmpty()
  @IsEmail()
  email: string
}

