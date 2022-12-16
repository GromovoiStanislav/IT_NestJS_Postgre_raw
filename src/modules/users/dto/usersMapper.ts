import { CreateUserDto } from "./create-user.dto";
import { InputUserDto } from "./input-user.dto";
import uid from "../../../utils/IdGenerator";
import dateAt from "../../../utils/DateGenerator";
import { ViewUserDto } from "./view-user.dto";
import { PaginatorDto } from "../../../commonDto/paginator.dto";
import { BanUsersInfo } from "./user-banInfo.dto";
import { UserBdDto } from "./user-bd.dto";


export default class UsersMapper {

  static fromInputToCreate(inputUser: InputUserDto, confirmationCode: string): CreateUserDto {
    const user = new CreateUserDto();
    user.id = uid();
    user.login = inputUser.login;
    user.password = inputUser.password;
    user.email = inputUser.email;
    user.createdAt = dateAt();

    user.confirmationCode =  confirmationCode;
    user.isEmailConfirmed =  false;

    user.recoveryCode = "";
    user.isRecoveryCodeConfirmed = false;

    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;

    return user;
  }

  static fromModelToView(user: UserBdDto): ViewUserDto {

    const banInfo = new BanUsersInfo();
    banInfo.isBanned = user.isBanned;
    banInfo.banDate = user.banDate;
    banInfo.banReason = user.banReason;

    const viewUser = new ViewUserDto();
    viewUser.id = user.id;
    viewUser.login = user.login;
    viewUser.email = user.email;
    viewUser.createdAt = user.createdAt;
    viewUser.banInfo = banInfo;
    return viewUser;
  }

  static fromModelsToPaginator(users: PaginatorDto<UserBdDto[]>): PaginatorDto<ViewUserDto[]> {
    return {
      pagesCount: users.pagesCount,
      page: users.page,
      pageSize: users.pageSize,
      totalCount: users.totalCount,
      items: users.items.map(user => UsersMapper.fromModelToView(user))
    };
  }


}