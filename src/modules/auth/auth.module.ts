import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";


import {
  ConfirmEmailUseCase, GetMeInfoUseCase,
  LoginUserUseCase, LogoutUserUseCase, RefreshTokenUseCase,
  RegisterUserUseCase,
  ResendConfirmationCodeUseCase
} from "./auth.service";

import { AuthController } from "./auth.controller";
import { Settings } from "../../settings";
import { JWT_Module } from "../jwt/jwt.module";
import { EmailModule } from "../email/email.module";



const useCases = [
  RegisterUserUseCase,
  ResendConfirmationCodeUseCase,
  ConfirmEmailUseCase,
  LoginUserUseCase,
  GetMeInfoUseCase,
  RefreshTokenUseCase,
  LogoutUserUseCase
];


@Module({
  imports: [CqrsModule, JWT_Module, EmailModule],
  controllers: [AuthController],
  providers: [...useCases, Settings]
})
export class AuthModule {
}
