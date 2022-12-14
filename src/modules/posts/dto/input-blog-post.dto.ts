import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class InputBlogPostDto {
  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string
}