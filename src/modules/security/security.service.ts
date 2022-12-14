import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "./security.repository";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JWT_Service } from "../jwt/jwt.service";
import { SecurityMapper } from "./dto/securityMapper";


//////////////////////////////////////////////////////////////
export class ClearAllDevicesCommand {
  constructor() {
  }
}

@CommandHandler(ClearAllDevicesCommand)
export class ClearAllDevicesUseCase implements ICommandHandler<ClearAllDevicesCommand> {
  constructor(private securityRepository: SecurityRepository) {
  }

  async execute(command: ClearAllDevicesCommand) {
    await this.securityRepository.clearAll();
  }
}


//////////////////////////////////////////////////////////////
export class ReturnAllDeviceSessionsByCurrentUserCommand {
  constructor(public refreshToken: string) {
  }
}

@CommandHandler(ReturnAllDeviceSessionsByCurrentUserCommand)
export class ReturnAllDeviceSessionsByCurrentUserUseCase implements ICommandHandler<ReturnAllDeviceSessionsByCurrentUserCommand> {
  constructor(
    private securityRepository: SecurityRepository,
    private jwtService: JWT_Service) {
  }

  async execute(command: ReturnAllDeviceSessionsByCurrentUserCommand) {
    if (!command.refreshToken) {
      throw new UnauthorizedException();
    }
    const dataFromToken = await this.jwtService.getInfoByRefreshToken(command.refreshToken);
    if (!dataFromToken) {
      throw new UnauthorizedException();
    }
    const data = await this.securityRepository.findAllByUserId(dataFromToken.userId);
    return data.map(el => SecurityMapper.fromModelToView(el));
  }
}


//////////////////////////////////////////////////////////////
export class TerminateAllOtherDeviceSessionsExcludeCurrentCommand {
  constructor(public refreshToken: string) {
  }
}

@CommandHandler(TerminateAllOtherDeviceSessionsExcludeCurrentCommand)
export class TerminateAllOtherDeviceSessionsExcludeCurrentUserUseCase implements ICommandHandler<TerminateAllOtherDeviceSessionsExcludeCurrentCommand> {
  constructor(
    private securityRepository: SecurityRepository,
    private jwtService: JWT_Service) {
  }

  async execute(command: TerminateAllOtherDeviceSessionsExcludeCurrentCommand) {
    if (!command.refreshToken) {
      throw new UnauthorizedException();
    }
    const dataFromToken = await this.jwtService.getInfoByRefreshToken(command.refreshToken);
    if (!dataFromToken) {
      throw new UnauthorizedException();
    }
    await this.securityRepository.deleteAllOtherExcludeDeviceId(dataFromToken.deviceId, dataFromToken.userId);
  }
}


//////////////////////////////////////////////////////////////
export class TerminateDeviceSessionCommand {
  constructor(public refreshToken: string, public deviceId: string) {
  }
}

@CommandHandler(TerminateDeviceSessionCommand)
export class TerminateDeviceSessionUseCase implements ICommandHandler<TerminateDeviceSessionCommand> {
  constructor(
    private securityRepository: SecurityRepository,
    private jwtService: JWT_Service) {
  }

  async execute(command: TerminateDeviceSessionCommand) {
    if (!command.refreshToken) {
      throw new UnauthorizedException();
    }
    const dataFromToken = await this.jwtService.getInfoByRefreshToken(command.refreshToken);
    if (!dataFromToken) {
      throw new UnauthorizedException();
    }
    const dataFromDeviceId = await this.securityRepository.findByDeviceId(command.deviceId);
    if (!dataFromDeviceId) {
      throw new NotFoundException();
    }
    if (dataFromToken.userId !== dataFromDeviceId.userId) {
      throw new ForbiddenException();
    }
    await this.securityRepository.deleteByDeviceId(command.deviceId);
  }
}


//////////////////////////////////////////////////////////////
export class AddOrUpdateDeviceSessionCommand {
  constructor(public tokenId: string, public userId: string, public deviceId: string, public ip: string, public title: string, public issuedAt: number) {
  }
}

@CommandHandler(AddOrUpdateDeviceSessionCommand)
export class AddOrUpdateDeviceSessionUseCase implements ICommandHandler<AddOrUpdateDeviceSessionCommand> {
  constructor(private securityRepository: SecurityRepository) {
  }

  async execute(command: AddOrUpdateDeviceSessionCommand) {
    const dataRefreshToken = {
      tokenId: command.tokenId,
      userId: command.userId,
      deviceId: command.deviceId,
      ip: command.ip,
      title: command.title,
      issuedAt: new Date(command.issuedAt).toISOString(),
      expiresIn: new Date(command.issuedAt + 20 * 1000).toISOString()
    };
    await this.securityRepository.addOrUpdateToken(dataRefreshToken);
  }
}


//////////////////////////////////////////////////////////////
export class KillSessionByDeviceIdCommand {
  constructor(public deviceId: string) {
  }
}

@CommandHandler(KillSessionByDeviceIdCommand)
export class KillSessionByDeviceIdUseCase implements ICommandHandler<KillSessionByDeviceIdCommand> {
  constructor(private securityRepository: SecurityRepository) {
  }

  async execute(command: KillSessionByDeviceIdCommand) {
    await this.securityRepository.deleteByDeviceId(command.deviceId);
  }
}

//////////////////////////////////////////////////////////////
export class FindSessionByTokenIdCommand {
  constructor(public tokenId: string) {
  }
}

@CommandHandler(FindSessionByTokenIdCommand)
export class FindSessionByTokenIdUseCase implements ICommandHandler<FindSessionByTokenIdCommand> {
  constructor(private securityRepository: SecurityRepository) {
  }

  async execute(command: FindSessionByTokenIdCommand) {
    return await this.securityRepository.findByTokenId(command.tokenId);
  }
}

//////////////////////////////////////////////////////////////
export class KillSessionByTokenIdCommand {
  constructor(public tokenId: string) {
  }
}

@CommandHandler(KillSessionByTokenIdCommand)
export class KillSessionByTokenIdUseCase implements ICommandHandler<KillSessionByTokenIdCommand> {
  constructor(private securityRepository: SecurityRepository) {
  }

  async execute(command: KillSessionByTokenIdCommand) {
    await this.securityRepository.deleteByTokenId(command.tokenId);
  }
}



//////////////////////////////////////////////////////////////
export class KillAllSessionsByUserIdCommand {
  constructor(public userId: string) {
  }
}

@CommandHandler(KillAllSessionsByUserIdCommand)
export class KillAllSessionsByUserIdUseCase implements ICommandHandler<KillAllSessionsByUserIdCommand> {
  constructor(private securityRepository: SecurityRepository) {
  }

  async execute(command: KillAllSessionsByUserIdCommand) {
    await this.securityRepository.deleteAllByUserId(command.userId);
  }
}