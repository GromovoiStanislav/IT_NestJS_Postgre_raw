import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Request } from "express";
import {
  ReturnAllDeviceSessionsByCurrentUserCommand,
  TerminateAllOtherDeviceSessionsExcludeCurrentCommand,
  TerminateDeviceSessionCommand
} from "./security.service";



@Controller("security")
export class SecurityController {

  constructor(private commandBus: CommandBus) {
  }


  @Get("devices")
  async returnAllDeviceSessionsByCurrentUser(@Req() req: Request) {
    return this.commandBus.execute(new ReturnAllDeviceSessionsByCurrentUserCommand(req.cookies.refreshToken));
  }


  @Delete("devices")
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateAllOtherDeviceSessionsExcludeCurrent(@Req() req: Request) {
    await this.commandBus.execute(new TerminateAllOtherDeviceSessionsExcludeCurrentCommand(req.cookies.refreshToken));
  }


  @Delete("devices/:deviceId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateDeviceSession(@Req() req: Request, @Param("deviceId") deviceId: string) {
    await this.commandBus.execute(new TerminateDeviceSessionCommand(req.cookies.refreshToken, deviceId ));
  }

}