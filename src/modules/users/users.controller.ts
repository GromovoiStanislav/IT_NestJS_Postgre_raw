import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus,
  Param,
  Post, Put,
  Query, UseGuards,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";

import { InputUserDto } from "./dto/input-user.dto";
import {
  BanUserCommand,
  CreateUserCommand,
  DeleteUserCommand,
  FindAllUsersCommand, GetUserByConfirmationCodeCommand
} from "./users.service";
import { BaseAuthGuard } from "../../guards/base.auth.guard";
import { Pagination } from "../../decorators/paginationDecorator";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { InputBanUserDto } from "./dto/input-ban-user.dto";
import { BearerAuthGuard } from "../../guards/bearer.auth.guard";
import { InputBanBlogUserDto } from "./dto/input-blog-ban-user.dto";
import { BanUserForBlogCommand, ReturnAllBannedUsersForBlogCommand } from "../blogs/blogs.service";
import { CurrentUserId } from "../../decorators/current-userId.decorator";

@UseGuards(BaseAuthGuard)
@Controller("sa/users")
export class SaUsersController {

  constructor(private commandBus: CommandBus) {
  }

  @Get()
  async getUsers(@Query() query, @Pagination() paginationParams: PaginationParams) {
    const searchLogin = query.searchLoginTerm as string || "";
    const searchEmail = query.searchEmailTerm as string || "";
    const banStatus = query.banStatus as string || "";

    return this.commandBus.execute(new FindAllUsersCommand(banStatus.trim(), searchLogin.trim(), searchEmail.trim(), paginationParams));
  }


  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param("id") userId: string) {
    await this.commandBus.execute(new DeleteUserCommand(userId));
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() inputUser: InputUserDto) {
    return this.commandBus.execute(new CreateUserCommand(inputUser, ""));
  }


  @Put(":id/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(@Param("id") userId: string, @Body() inputBanUser: InputBanUserDto) {
    await this.commandBus.execute(new BanUserCommand(userId, inputBanUser));
  }

  @Get("confirmationCode/:cod")
  async getUsersByConfirmationCode(@Param("cod") confirmationCode: string) {
    return this.commandBus.execute(new GetUserByConfirmationCodeCommand(confirmationCode));
  }


}

@UseGuards(BearerAuthGuard)
@Controller("blogger/users")
export class BloggerUsersController {

  constructor(private commandBus: CommandBus) {
  }


  @Put(":userId/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(@Param("userId") userId: string,
                @Body() inputBanBlogUserDto: InputBanBlogUserDto,
                @CurrentUserId() ownerId: string) {
    await this.commandBus.execute(new BanUserForBlogCommand(ownerId, userId, inputBanBlogUserDto));
  }


  @Get("blog/:blogId")
  async getUsers(@Param("blogId") blogId: string,
                 @Query() query,
                 @Pagination() paginationParams: PaginationParams,
                 @CurrentUserId() ownerId: string) {
    const searchLogin = query.searchLoginTerm as string || "";
    return this.commandBus.execute(new ReturnAllBannedUsersForBlogCommand(ownerId, blogId, searchLogin.trim(), paginationParams));
  }

}
