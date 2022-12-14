import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
//import * as cookieParser from 'cookie-parser';

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

// export class AuthModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(cookieParser)
//       .forRoutes('auth');
//   }
// }