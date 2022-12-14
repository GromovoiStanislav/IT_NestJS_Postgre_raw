import { CommandBus } from "@nestjs/cqrs";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

import { InputUserDto } from "./dto/input-user.dto";

import {
  ConfirmUserCommand,
  CreateUserCommand, GetUserByConfirmationCodeCommand, GetUserByIdCommand,
  GetUserByLoginOrEmailCommand,
  UpdateConfirmCodeCommand
} from "../users/users.service";
import { comparePassword } from "../../utils/bcryptUtils";
import { JWT_Service } from "../jwt/jwt.service";
import { EmailService } from "../email/email.service";
import {
  AddOrUpdateDeviceSessionCommand,
  FindSessionByTokenIdCommand,
  KillSessionByDeviceIdCommand, KillSessionByTokenIdCommand
} from "../security/security.service";
import uid from "../../utils/IdGenerator";


////////////////////////////////////////////////////////////////////
export class RegisterUserCommand {
  constructor(public inputUser: InputUserDto) {
  }
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(private commandBus: CommandBus,
              private emailAdapter: EmailService) {
  }

  async execute(command: RegisterUserCommand) {

    if (await this.commandBus.execute(new GetUserByLoginOrEmailCommand(command.inputUser.login))) {
      throw new BadRequestException([{ field: "login", message: "login already exists" }]);
    }
    if (await this.commandBus.execute(new GetUserByLoginOrEmailCommand(command.inputUser.email))) {
      throw new BadRequestException([{ field: "email", message: "email already exists" }]);
    }

    const subject = "Thank for your registration";
    const confirmation_code = uuidv4();
    const message = `
        <div>
           <h1>Thank for your registration</h1>
           <p>To finish registration please follow the link below:
              <a href="https://it-nest.vercel.app/auth/registration-confirmation?code=${confirmation_code}">complete registration</a>
          </p>
        </div>`;

    const isEmailSend = await this.emailAdapter.sendEmail(command.inputUser.email, subject, message);
    if (isEmailSend) {
      await this.commandBus.execute(new CreateUserCommand(command.inputUser, confirmation_code));
    }
  }
}


/////////////////////////////////////////////////////////////////
export class ResendConfirmationCodeCommand {
  constructor(public email: string) {
  }
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase implements ICommandHandler<ResendConfirmationCodeCommand> {
  constructor(private commandBus: CommandBus,
              private emailAdapter: EmailService) {
  }

  async execute(command: ResendConfirmationCodeCommand) {

    const user = await this.commandBus.execute(new GetUserByLoginOrEmailCommand(command.email));
    if (!user) {
      throw new BadRequestException([{ field: "email", message: "email not exist" }]);
    }
    if (user.emailConfirmation?.isConfirmed) {
      throw new BadRequestException([{ field: "email", message: "email already confirmed" }]);
    }

    const subject = "Thank for your registration";
    const confirmation_code = uuidv4();
    const message = `<a href="https://it-nest.vercel.app/auth/registration-confirmation?code=${confirmation_code}">complete registration</a>`;

    const isEmailSend = await this.emailAdapter.sendEmail(command.email, subject, message);
    if (isEmailSend) {
      await this.commandBus.execute(new UpdateConfirmCodeCommand(user.id, confirmation_code));
    }
  }
}


/////////////////////////////////////////////////////////////////
export class ConfirmEmailCommand {
  constructor(public confirmationCode: string) {
  }
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
  constructor(private commandBus: CommandBus) {
  }

  async execute(command: ConfirmEmailCommand) {
    const user = await this.commandBus.execute(new GetUserByConfirmationCodeCommand(command.confirmationCode));
    if (!user) {
      throw new BadRequestException([{ field: "code", message: "code not exist" }]);
    }
    if (user.emailConfirmation?.isConfirmed) {
      throw new BadRequestException([{ field: "code", message: "code already confirmed" }]);
    }

    await this.commandBus.execute(new ConfirmUserCommand(user.id));
  }
}

/////////////////////////////////////////////////////////////////
export class LoginUserCommand {
  constructor(public loginOrEmail: string, public password: string, public ip: string, public title: string) {
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWT_Service
  ) {
  }

  async execute(command: LoginUserCommand) {
    const user = await this.commandBus.execute(new GetUserByLoginOrEmailCommand(command.loginOrEmail));
    if (user) {
      const compareOK = await comparePassword(command.password, user.password);
      if (compareOK && !user.banInfo.isBanned) {
        const deviceId = uuidv4(); // т.е. это Сессия
        const tokenId = uuidv4();
        const issuedAt = Date.now();
        const accessToken = await this.jwtService.createAuthJWT(user.id);
        const refreshToken = await this.jwtService.createRefreshJWT(tokenId, user.id, deviceId, new Date(issuedAt).toISOString());

        await this.commandBus.execute(new AddOrUpdateDeviceSessionCommand(tokenId, user.id, deviceId, command.ip, command.title, issuedAt));
        return { accessToken, refreshToken };
      }
    }
    throw new UnauthorizedException();
  }
}

/////////////////////////////////////////////////////////////////
export class GetMeInfoCommand {
  constructor(public userId: string) {
  }
}

@CommandHandler(GetMeInfoCommand)
export class GetMeInfoUseCase implements ICommandHandler<GetMeInfoCommand> {
  constructor(private commandBus: CommandBus) {
  }

  async execute(command: GetMeInfoCommand) {
    const user = await this.commandBus.execute(new GetUserByIdCommand(command.userId));
    return {
      email: user.email,
      login: user.login,
      userId: user.id
    };

  }
}


/////////////////////////////////////////////////////////////////
export class RefreshTokenCommand {
  constructor(public refreshToken: string, public ip: string, public title: string) {
  }
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWT_Service
  ) {
  }

  async execute(command: RefreshTokenCommand) {
    if (!command.refreshToken) {
      throw new UnauthorizedException();
    }
    const data = await this.jwtService.getInfoByRefreshToken(command.refreshToken);
    if (!data) {
      throw new UnauthorizedException();
    }
    const session = await this.commandBus.execute(new FindSessionByTokenIdCommand(data.tokenId));
    if (!session) {
      throw new UnauthorizedException();
    }

    await this.commandBus.execute(new KillSessionByTokenIdCommand(data.tokenId));

    const tokenId = uuidv4();
    const issuedAt = Date.now();
    const accessToken = await this.jwtService.createAuthJWT(data.userId);
    const refreshToken = await this.jwtService.createRefreshJWT(tokenId, data.userId, data.deviceId, new Date(issuedAt).toISOString());

    await this.commandBus.execute(new AddOrUpdateDeviceSessionCommand(tokenId, data.userId, data.deviceId, command.ip, command.title, issuedAt));
    return { accessToken, refreshToken };
  }
}

/////////////////////////////////////////////////////////////////
export class LogoutUserCommand {
  constructor(public refreshToken: string) {
  }
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private jwtService: JWT_Service
  ) {
  }

  async execute(command: LogoutUserCommand) {
    if (!command.refreshToken) {
      throw new UnauthorizedException();
    }
    const data = await this.jwtService.getInfoByRefreshToken(command.refreshToken);
    if (!data) {
      throw new UnauthorizedException();
    }
    const session = await this.commandBus.execute(new FindSessionByTokenIdCommand(data.tokenId));
    if (!session) {
      throw new UnauthorizedException();
    }

    await this.commandBus.execute(new KillSessionByDeviceIdCommand(data.deviceId));
  }
}