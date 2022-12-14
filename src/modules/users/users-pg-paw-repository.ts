import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { BanUsersInfo } from "./dto/user-banInfo.dto";
import { User } from "./schemas/users.schema";


@Injectable()
export class UsersPgPawRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }


  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."Users";
    `);
  }

  async deleteUser(userId: string) {
    const result = await this.dataSource.query(`
    DELETE FROM public."Users"
    WHERE "Id" = $1;
    `, [userId]);
    return result[1];
  }


  async getAll() {
    return this.dataSource.query(`
    SELECT "Login", "Password", "Email", "CreatedAt", "ConfirmationCode", "IsEmailConfirmed", "recoveryCode", "IsRecoveryCodeConfirmed", "IsBanned", "BanDate", "BanReason", "Id"
    FROM public."Users";
    `);
  }


  async findUserById(id: string): Promise<User | null> {
    return this.dataSource.query(`
    SELECT "Login", "Password", "Email", "CreatedAt", "ConfirmationCode", "IsEmailConfirmed", "recoveryCode", "IsRecoveryCodeConfirmed", "IsBanned", "BanDate", "BanReason", "Id"
    FROM public."Users"
    WHERE "Id" = $1;
    `, [id]);
  }

  async getBanedUsers(): Promise<User[]> {
    return this.dataSource.query(`
    SELECT "Login", "Password", "Email", "CreatedAt", "ConfirmationCode", "IsEmailConfirmed", "recoveryCode", "IsRecoveryCodeConfirmed", "IsBanned", "BanDate", "BanReason", "Id"
    FROM public."Users"
    WHERE "IsBanned"=true;
    `);
  }

  async findUserByLoginOrEmail(search): Promise<User> {
    return this.dataSource.query(`
    SELECT "Login", "Password", "Email", "CreatedAt", "ConfirmationCode", "IsEmailConfirmed", "recoveryCode", "IsRecoveryCodeConfirmed", "IsBanned", "BanDate", "BanReason", "Id"
    FROM public."Users"
    WHERE "Login"=$1 or "Email"=$1;
    `, [search]);
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return this.dataSource.query(`
    SELECT "Login", "Password", "Email", "CreatedAt", "ConfirmationCode", "IsEmailConfirmed", "recoveryCode", "IsRecoveryCodeConfirmed", "IsBanned", "BanDate", "BanReason", "Id"
    FROM public."Users"
    WHERE "ConfirmationCode"=$1;
    `, [confirmationCode]);
  }


  async createUser(createUserDto: CreateUserDto) {

    const result = await this.dataSource.query(`
    INSERT INTO public."Users"(
    "Id", "Login", "Password", "Email", "CreatedAt", "ConfirmationCode", "IsEmailConfirmed", "recoveryCode", "IsRecoveryCodeConfirmed", "IsBanned", "BanDate", "BanReason")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `, [
      createUserDto.id,
      createUserDto.login,
      createUserDto.password,
      createUserDto.email,
      createUserDto.createdAt,
      createUserDto.emailConfirmation.confirmationCode,
      createUserDto.emailConfirmation.isConfirmed,
      createUserDto.recoveryPassword.recoveryCode,
      createUserDto.recoveryPassword.isConfirmed,
      createUserDto.banInfo.isBanned,
      createUserDto.banInfo.banDate,
      createUserDto.banInfo.banReason
    ]);
    return createUserDto;
  }

  async banUser(userId: string, banInfo: BanUsersInfo): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."Users"
    SET "IsBanned"=$2, "BanDate"=$3, "BanReason"=$4
    WHERE "Id" = $1;
    `, [userId, banInfo.isBanned, banInfo.banDate, banInfo.banReason]);
  }

  async confirmUser(userId: string): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."Users"
    SET "IsEmailConfirmed"=true
    WHERE "Id" = $1;
    `, [userId]);

  }

  async updateConfirmCode(userId: string, confirmationCode: string): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."Users"
    SET "ConfirmationCode"=$2
    WHERE "Id" = $1;
    `, [userId, confirmationCode]);
  }


}