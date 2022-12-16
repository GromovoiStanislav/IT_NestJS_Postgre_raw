import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SecurityController } from "./security.controller";
import {
  AddOrUpdateDeviceSessionUseCase,
  ClearAllDevicesUseCase,
  FindSessionByTokenIdUseCase,
  KillAllSessionsByUserIdUseCase,
  KillSessionByDeviceIdUseCase,
  KillSessionByTokenIdUseCase,
  ReturnAllDeviceSessionsByCurrentUserUseCase,
  TerminateAllOtherDeviceSessionsExcludeCurrentUserUseCase,
  TerminateDeviceSessionUseCase
} from "./security.service";
import { JWT_Module } from "../jwt/jwt.module";
import { DevicesPgPawRepository } from "./devices-pg-paw-repository";



const useCases = [
  ClearAllDevicesUseCase,
  ReturnAllDeviceSessionsByCurrentUserUseCase,
  TerminateAllOtherDeviceSessionsExcludeCurrentUserUseCase,
  TerminateDeviceSessionUseCase,
  AddOrUpdateDeviceSessionUseCase,
  KillSessionByDeviceIdUseCase,
  FindSessionByTokenIdUseCase,
  KillSessionByTokenIdUseCase,
  KillAllSessionsByUserIdUseCase
];

@Module({
  imports: [
    CqrsModule, JWT_Module,
  ],
  controllers: [SecurityController],
  providers: [...useCases,DevicesPgPawRepository]
})
export class SecurityModule {
}
