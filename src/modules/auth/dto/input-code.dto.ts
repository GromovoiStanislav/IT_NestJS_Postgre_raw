import { IsNotEmpty, IsString } from "class-validator";


export class InputCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string
}

