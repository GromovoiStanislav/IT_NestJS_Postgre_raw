import { InputUserDto } from "./dto/input-user.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { generateHash } from "../../utils/bcryptUtils";
import UsersMapper from "./dto/usersMapper";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InputBanUserDto } from "./dto/input-ban-user.dto";
import { BanUsersInfo } from "./dto/user-banInfo.dto";
import dateAt from "../../utils/DateGenerator";
import { KillAllSessionsByUserIdCommand } from "../security/security.service";
import { UsersPgPawRepository } from "./users-pg-paw-repository";
import { NotFoundException } from "@nestjs/common";
import { UserBdDto } from "./dto/user-bd.dto";

//////////////////////////////////////////////////////////////
export class ClearAllUsersCommand {
  constructor() {
  }
}

@CommandHandler(ClearAllUsersCommand)
export class ClearAllUsersUseCase implements ICommandHandler<ClearAllUsersCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: ClearAllUsersCommand) {
    await this.usersRepository.clearAll();
  }
}

////////////////////////////////////////////////////
export class FindAllUsersCommand {
  constructor(public banStatus: string, public searchLogin: string, public searchEmail: string, public paginationParams: PaginationParams) {
  }
}

@CommandHandler(FindAllUsersCommand)
export class FindAllUsersUseCase implements ICommandHandler<FindAllUsersCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: FindAllUsersCommand) {
    const result = await this.usersRepository.getAllUsers(command.banStatus,command.searchLogin, command.searchEmail, command.paginationParams);
    return UsersMapper.fromModelsToPaginator(result);
  }
}





////////////////////////////////////////////////////////////
export class DeleteUserCommand {
  constructor(public userId: string) {
  }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: DeleteUserCommand) {
    const result = await this.usersRepository.deleteUser(command.userId);
    if (!result) {
      throw new NotFoundException();
    }
  }
}

////////////////////////////////////////////////////////////
export class CreateUserCommand {
  constructor(public inputUser: InputUserDto, public confirmationCode: string) {
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: CreateUserCommand) {
    const createUser = UsersMapper.fromInputToCreate(command.inputUser, command.confirmationCode);
    createUser.password = await generateHash(createUser.password);
    return UsersMapper.fromModelToView(await this.usersRepository.createUser(createUser));
  }
}

////////////////////////////////////////////////////////////
export class GetUserByLoginOrEmailCommand {
  constructor(public search: string) {
  }
}

@CommandHandler(GetUserByLoginOrEmailCommand)
export class GetUserByLoginOrEmailUseCase implements ICommandHandler<GetUserByLoginOrEmailCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: GetUserByLoginOrEmailCommand) {
    return await this.usersRepository.findUserByLoginOrEmail(command.search);
  }
}


////////////////////////////////////////////////////////////
export class GetUserByIdCommand {
  constructor(public userId: string) {
  }
}

@CommandHandler(GetUserByIdCommand)
export class GetUserByIdUseCase implements ICommandHandler<GetUserByIdCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: GetUserByIdCommand): Promise<UserBdDto | null>  {
    return await this.usersRepository.findUserById(command.userId);
  }
}


////////////////////////////////////////////////////////////
export class UpdateConfirmCodeCommand {
  constructor(public userId: string, public confirmationCode: string) {
  }
}

@CommandHandler(UpdateConfirmCodeCommand)
export class UpdateConfirmCodeUseCase implements ICommandHandler<UpdateConfirmCodeCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: UpdateConfirmCodeCommand) {
    await this.usersRepository.updateConfirmCode(command.userId, command.confirmationCode);
  }
}

////////////////////////////////////////////////////////////
export class GetUserByConfirmationCodeCommand {
  constructor(public confirmationCode: string) {
  }
}

@CommandHandler(GetUserByConfirmationCodeCommand)
export class GetUserByConfirmationCodeUseCase implements ICommandHandler<GetUserByConfirmationCodeCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: GetUserByConfirmationCodeCommand) {
    return await this.usersRepository.findUserByConfirmationCode(command.confirmationCode);
  }
}


////////////////////////////////////////////////////////////
export class ConfirmUserCommand {
  constructor(public userId: string) {
  }
}

@CommandHandler(ConfirmUserCommand)
export class ConfirmUserUseCase implements ICommandHandler<ConfirmUserCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: ConfirmUserCommand) {
    return await this.usersRepository.confirmUser(command.userId);
  }
}


////////////////////////////////////////////////////////////
export class BanUserCommand {
  constructor(public userId: string, public inputBanUser: InputBanUserDto) {
  }
}

@CommandHandler(BanUserCommand)
export class BanUserUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersPgPawRepository) {
  }

  async execute(command: BanUserCommand) {

    const banInfo = new BanUsersInfo();
    if(command.inputBanUser.isBanned) {
      banInfo.isBanned = true;
      banInfo.banDate = dateAt();
      banInfo.banReason = command.inputBanUser.banReason;
    }

    await this.usersRepository.banUser(command.userId, banInfo);
    await this.commandBus.execute(new KillAllSessionsByUserIdCommand(command.userId))

  }
}

////////////////////////////////////////////////////
export class GetIdBannedUsersCommand {
  constructor() {
  }
}

@CommandHandler(GetIdBannedUsersCommand)
export class GetIdBannedUsersUseCase implements ICommandHandler<GetIdBannedUsersCommand> {
  constructor(protected usersRepository: UsersPgPawRepository) {
  }

  async execute(command: GetIdBannedUsersCommand): Promise<string[]> {
    const users = await this.usersRepository.getBanedUsers();
    return users.map(user => user.id)
  }
}