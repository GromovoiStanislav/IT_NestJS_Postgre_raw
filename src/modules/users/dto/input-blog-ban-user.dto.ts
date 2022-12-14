import { Transform, TransformFnParams } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString, MinLength } from "class-validator";


export class InputBanBlogUserDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  banReason: string;

  @Transform(({value}:TransformFnParams)=>value?.trim())
  @IsString()
  @IsNotEmpty()
  blogId: string;
}