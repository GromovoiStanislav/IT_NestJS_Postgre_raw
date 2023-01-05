import {
  Body,
  Controller,
  Delete, Get,
  HttpCode,
  HttpStatus, NotFoundException,
  Param, Post, Put, UseGuards
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  CreatePostCommand,
  DeletePostCommand,
  GetAllPostsCommand,
  GetOnePostCommand, GetOnePostWithLikesCommand, PostsUpdateLikeByIDCommand,
  UpdatePostCommand
} from "./posts.service";
import { InputPostDto } from "./dto/input-post.dto";
import { ViewPostDto } from "./dto/view-post.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { Pagination } from "../../decorators/paginationDecorator";
import { InputLikeDto } from "./dto/input-like.dto";
import { CurrentUserId } from "../../decorators/current-userId.decorator";
import { AuthUserIdGuard } from "../../guards/auth.userId.guard";
import { BaseAuthGuard } from "../../guards/base.auth.guard";
import { InputCommentDto } from "./dto/input-comment.dto";
import { CreateCommentByPostIDCommand, GetAllCommentsByPostIDCommand } from "../comments/comments.service";


@Controller("posts")
export class PostsController {
  constructor(
    private commandBus: CommandBus) {
  }


  @Delete(":id")
  @UseGuards(BaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param("id") postId: string): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(postId));
  }


  @Post()
  @UseGuards(BaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() inputPost: InputPostDto): Promise<ViewPostDto> {
    return this.commandBus.execute(new CreatePostCommand(inputPost));
  }


  @Put(":id")
  @UseGuards(BaseAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Param("id") postId: string, @Body() inputPost: InputPostDto): Promise<void> {
    const result = await this.commandBus.execute(new UpdatePostCommand(postId, inputPost));
    if (!result) {
      throw new NotFoundException();
    }
  }


  @Get(":id")
  async getOnePost(
    @Param("id") postId: string,
    @CurrentUserId() userId: string
  ): Promise<ViewPostDto> {
    return await this.commandBus.execute(new GetOnePostWithLikesCommand(postId, userId));
  }


  @Get()
  async getAllPosts(
    @Pagination() paginationParams: PaginationParams,
    @CurrentUserId() userId: string
  ): Promise<PaginatorDto<ViewPostDto[]>> {
    return this.commandBus.execute(new GetAllPostsCommand(paginationParams, userId));
  }


  @Put(":postId/like-status")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthUserIdGuard)
  async updateLikeByID(
    @Param("postId") postId: string,
    @Body() inputLike: InputLikeDto,
    @CurrentUserId() userId: string) {
    const result = await this.commandBus.execute(new GetOnePostCommand(postId));
    if (!result) {
      throw new NotFoundException();
    }
    return this.commandBus.execute(new PostsUpdateLikeByIDCommand(postId, userId, inputLike.likeStatus));
  }


  @Post(":postId/comments")
  @UseGuards(AuthUserIdGuard)
  async createCommentByPostID(
    @Param("postId") postId: string,
    @Body() inputComment: InputCommentDto,
    @CurrentUserId() userId: string) {
    return this.commandBus.execute(new CreateCommentByPostIDCommand(postId, userId, inputComment));
  }


  @Get(":postId/comments")
  async getAllCommentsByPostID(
    @Param("postId") postId: string,
    @Pagination() paginationParams: PaginationParams,
    @CurrentUserId() userId: string) {

    return this.commandBus.execute(new GetAllCommentsByPostIDCommand(paginationParams, postId, userId));
  }


}
