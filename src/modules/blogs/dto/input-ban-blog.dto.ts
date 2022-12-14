import { IsNotEmpty, IsBoolean } from "class-validator";


export class InputBanBlogDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean
}

