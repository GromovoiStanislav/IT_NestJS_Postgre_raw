import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BloggerUsersController, SaUsersController } from "./users.controller";
import {
  BanUserUserUseCase,
  ClearAllUsersUseCase,
  ConfirmUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  FindAllUsersUseCase, GetIdBannedUsersUseCase,
  GetUserByConfirmationCodeUseCase,
  GetUserByIdUseCase,
  GetUserByLoginOrEmailUseCase,
  UpdateConfirmCodeUseCase
} from "./users.service";
import { User, UserSchema } from "./schemas/users.schema";
import { UsersRepository } from "./users.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { JWT_Module } from "../jwt/jwt.module";
import { UsersPgPawRepository } from "./users-pg-paw-repository";

const useCases = [
  ClearAllUsersUseCase,
  FindAllUsersUseCase,
  DeleteUserUseCase,
  CreateUserUseCase,
  GetUserByLoginOrEmailUseCase,
  UpdateConfirmCodeUseCase,
  GetUserByConfirmationCodeUseCase,
  ConfirmUserUseCase,
  GetUserByIdUseCase,
  BanUserUserUseCase,
  GetIdBannedUsersUseCase
];

@Module({
  imports: [CqrsModule, JWT_Module, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [SaUsersController, BloggerUsersController],
  providers: [...useCases, UsersRepository, UsersPgPawRepository]
})
export class UsersModule {
}