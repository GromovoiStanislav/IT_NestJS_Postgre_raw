import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { BanUsersInfo } from "./dto/user-banInfo.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { UserBdDto } from "./dto/user-bd.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";


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

  async deleteUser(userId: string): Promise<number> {
    const result = await this.dataSource.query(`
    DELETE FROM public."users"
    WHERE "id" = $1;
    `, [userId]);
    return result[1];
  }


  async getAllUsers(banStatus: string,
                    searchLogin: string,
                    searchEmail: string, {
                      pageNumber,
                      pageSize,
                      sortBy,
                      sortDirection
                    }: PaginationParams): Promise<PaginatorDto<UserBdDto[]>> {


    if (!["login", "email", "createdAt"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";

    let filter = "";
    if (searchLogin && searchEmail) {
      filter = `WHERE ("login" ~* '${searchLogin}' or "email" ~* '${searchEmail}')`;
    } else if (searchLogin) {
      filter = `WHERE "login" ~* '${searchLogin}'`;
    } else if (searchEmail) {
      filter = `WHERE "email" ~* '${searchEmail}'`;
    }

    if (["notBanned", "banned"].includes(banStatus)) {
      if (filter !== "") {
        if (banStatus === "banned") {
          filter = filter + ` AND "isBanned" = true`;
        } else if (banStatus === "notBanned") {
          filter = filter + ` AND "isBanned" = false`;
        }
      } else {
        if (banStatus === "banned") {
          filter = `WHERE "isBanned" = true`;
        } else if (banStatus === "notBanned") {
          filter = `WHERE "isBanned" = false`;
        }
      }
    }


    const items = await this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    ${filter}
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `);


    let totalCount = 0;
    const resultCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."users"
    ${filter};
    `);
    if (resultCount.length > 0) {
      totalCount = +resultCount[0].count;
    }


    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


  async findUserById(id: string): Promise<UserBdDto | null> {
    const result = await this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "id" = $1;
    `, [id]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async getBanedUsers(): Promise<UserBdDto[]> {
    return this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "isBanned"=true;
    `);
  }


  async findUserByLoginOrEmail(search): Promise<UserBdDto> {
    const result = await this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "login"=$1 or "email"=$1;
    `, [search]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async findUserByConfirmationCode(confirmationCode: string): Promise<UserBdDto | null> {
    const result = await this.dataSource.query(`
    SELECT "login", "password", "email", "createdAt", "confirmationCode", "isEmailConfirmed", "recoveryCode", "isRecoveryCodeConfirmed", "isBanned", "banDate", "banReason", "id"
    FROM public."users"
    WHERE "confirmationCode"=$1;
    `, [confirmationCode]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async createUser(createUserDto: CreateUserDto): Promise<UserBdDto> {
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
      createUserDto.confirmationCode,
      createUserDto.isEmailConfirmed,
      createUserDto.recoveryCode,
      createUserDto.isRecoveryCodeConfirmed,
      createUserDto.isBanned,
      createUserDto.banDate,
      createUserDto.banReason
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
    WHERE "id" = $1;
    `, [userId]);

  }


  async updateConfirmCode(userId: string, confirmationCode: string): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."users"
    SET "confirmationCode"=$2
    WHERE "id" = $1;
    `, [userId, confirmationCode]);
  }


}