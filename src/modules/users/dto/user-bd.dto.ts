export class UserBdDto {
  id: string;
  login: string;
  password: string;
  email: string;
  createdAt: string;

  confirmationCode: string
  isEmailConfirmed: boolean

  recoveryCode: string
  isRecoveryCodeConfirmed: boolean

  isBanned: boolean = false;
  banDate: string = null;
  banReason: string = null;
}