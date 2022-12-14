import { CreateUserDto } from "./create-user.dto";
import { InputUserDto } from "./input-user.dto";
import uid from "../../../utils/IdGenerator";
import dateAt from "../../../utils/DateGenerator";
import { ViewUserDto } from "./view-user.dto";
import { User } from "../schemas/users.schema";
import { PaginatorDto } from "../../../commonDto/paginator.dto";
import { BanUsersInfo } from "./user-banInfo.dto";


export default class UsersMapper {

  static fromInputToCreate(inputUser: InputUserDto, confirmationCode: string): CreateUserDto {
    const user = new CreateUserDto();
    user.id = uid();
    user.login = inputUser.login;
    user.password = inputUser.password;
    user.email = inputUser.email;
    user.createdAt = dateAt();
    user.emailConfirmation = {
      confirmationCode: confirmationCode,
      isConfirmed: false
    };
    user.recoveryPassword = {
      recoveryCode: "",
      isConfirmed: false
    };
    user.banInfo = new BanUsersInfo();
    return user;
  }

  static fromModelToView(user: User): ViewUserDto {

    const banInfo = new BanUsersInfo();
    banInfo.isBanned = user.banInfo.isBanned;
    banInfo.banDate = user.banInfo.banDate;
    banInfo.banReason = user.banInfo.banReason;


    const viewUser = new ViewUserDto();
    viewUser.id = user.id;
    viewUser.login = user.login;
    viewUser.email = user.email;
    viewUser.createdAt = user.createdAt;
    viewUser.banInfo = banInfo;
    return viewUser;
  }

  static fromModelsToPaginator(users: PaginatorDto<User[]>): PaginatorDto<ViewUserDto[]> {
    return {
      pagesCount: users.pagesCount,
      page: users.page,
      pageSize: users.pageSize,
      totalCount: users.totalCount,
      items: users.items.map(user => UsersMapper.fromModelToView(user))
    };
  }


}