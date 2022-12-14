import { BanUsersInfo } from "./user-banInfo.dto";

export class CreateUserDto {
  id: string;
  login: string;
  password: string;
  email: string;
  createdAt: string;
  emailConfirmation: {
    confirmationCode: string,
    isConfirmed: boolean
  };
  recoveryPassword: {
    recoveryCode: string,
    isConfirmed: boolean
  };
  banInfo: BanUsersInfo;
}