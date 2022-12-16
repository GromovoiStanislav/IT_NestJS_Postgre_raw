import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { BanUsersInfo } from "./dto/user-banInfo.dto";
import { User } from "./schemas/users.schema";
import { PaginationParams } from "../../commonDto/paginationParams.dto";


@Injectable()
export class UsersPgPawRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }


  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."users";
    `);
  }

  async deleteUser(userId: string) {
    const result = await this.dataSource.query(`
    DELETE FROM public."users"
    WHERE "id" = $1;
    `, [userId]);
    return result[1];
  }


  async getAllUsers(searchLogin: string, searchEmail: string, {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection
  }: PaginationParams) {

    if (!["login", "email", "createdAt"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";

    const items = await this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE ("login" ~* '${searchLogin}' or "email" ~* '${searchEmail}')
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `);

    const totalCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."users"
    WHERE ("login" ~* '${searchLogin}' or "email" ~* '${searchEmail}');
    `);

    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


  async findUserById(id: string): Promise<User | null> {
    return this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "id" = $1;
    `, [id]);
  }

  async getBanedUsers(): Promise<User[]> {
    return this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "isBanned"=true;
    `);
  }

  async findUserByLoginOrEmail(search): Promise<User> {
    return this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "login"=$1 or "email"=$1;
    `, [search]);
  }

  async findUserByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "confirmationCode"=$1;
    `, [confirmationCode]);
  }


  async createUser(createUserDto: CreateUserDto) {

    const result = await this.dataSource.query(`
    INSERT INTO public."users"(
    "id","login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason")
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
    UPDATE public."users"
    SET "isBanned"=$2, "banDate"=$3, "banReason"=$4
    WHERE "id" = $1;
    `, [userId, banInfo.isBanned, banInfo.banDate, banInfo.banReason]);
  }

  async confirmUser(userId: string): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."users"
    SET "isEmailConfirmed"=true
    WHERE "Id" = $1;
    `, [userId]);

  }

  async updateConfirmCode(userId: string, confirmationCode: string): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."users"
    SET "ConfirmationCode"=$2
    WHERE "id" = $1;
    `, [userId, confirmationCode]);
  }


}