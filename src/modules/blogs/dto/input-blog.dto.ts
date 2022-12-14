import { IsString, IsNotEmpty, MaxLength, Matches, IsUrl } from "class-validator";
import { Transform, TransformFnParams } from "class-transformer";

export class InputBlogDto {
  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  name: string

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/ as RegExp)
  @IsUrl()
  websiteUrl: string
}

