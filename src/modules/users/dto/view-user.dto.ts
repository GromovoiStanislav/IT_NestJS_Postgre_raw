import { BanUsersInfo } from "./user-banInfo.dto";

export class ViewUserDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: BanUsersInfo;
}

