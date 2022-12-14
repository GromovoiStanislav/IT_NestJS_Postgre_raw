import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class InputCommentDto {
  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(300)
  content: string
}