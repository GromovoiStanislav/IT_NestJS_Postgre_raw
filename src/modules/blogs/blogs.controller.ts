import {
  Body,
  Controller, Delete,
  Get,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  Post, Put, Query, UseGuards
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  BanBlogCommand,
  BindBlogWithUserCommand,
  CreateBlogCommand,
  DeleteBlogCommand, GetAllBlogsByUserIdCommand, GetAllBlogsCommand, GetAllCommentsForMyBlogsCommand,
  GetOneBlogCommand,
  UpdateBlogCommand
} from "./blogs.service";
import { InputBlogDto } from "./dto/input-blog.dto";
import { ViewBlogDto } from "./dto/view-blog.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";
import { ViewPostDto } from "../posts/dto/view-post.dto";
import {
  CreatePostByBlogIdCommand,
  DeletePostByBlogIdAndPostIdCommand,
  GetAllPostsByBlogIdCommand, UpdatePostByBlogIdAndPostIdCommand
} from "../posts/posts.service";
import { InputBlogPostDto } from "../posts/dto/input-blog-post.dto";
import { Pagination } from "../../decorators/paginationDecorator";
import { BaseAuthGuard } from "../../guards/base.auth.guard";
import { BearerUserIdGuard } from "../../guards/bearer.userId.guard";
import { CurrentUserId } from "../../decorators/current-userId.decorator";
import { AuthUserIdGuard } from "../../guards/auth.userId.guard";
import { InputBanBlogDto } from "./dto/input-ban-blog.dto";


//////////////////////////////////////////////////////////////

@Controller("blogs")
export class BlogsController {

  constructor(
    private commandBus: CommandBus) {
  }

  @Get()
  async getAllBlogs(@Query() query, @Pagination() paginationParams: PaginationParams): Promise<PaginatorDto<ViewBlogDto[]>> {
    const searchNameTerm = query.searchNameTerm as string || "";
    return this.commandBus.execute(new GetAllBlogsCommand(searchNameTerm.trim(), paginationParams));
  }


  @Get(":id")
  async getOneBlog(@Param("id") blogId: string): Promise<ViewBlogDto> {
    const result = await this.commandBus.execute(new GetOneBlogCommand(blogId));
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }


  @Get(":blogId/posts")
  @UseGuards(BearerUserIdGuard)
  async getOnePost(
    @Param("blogId") blogId: string,
    @CurrentUserId() userId: string,
    @Pagination() paginationParams: PaginationParams): Promise<PaginatorDto<ViewPostDto[]>> {
    if (!await this.commandBus.execute(new GetOneBlogCommand(blogId))) {
      throw new NotFoundException();
    }
    return this.commandBus.execute(new GetAllPostsByBlogIdCommand(blogId, userId, paginationParams));
  }

}

//////////////////////////////////////////////////////////////

@UseGuards(AuthUserIdGuard)
@Controller("blogger/blogs")
export class BloggerBlogsController {

  constructor(
    private commandBus: CommandBus) {
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() inputBlog: InputBlogDto,
                   @CurrentUserId() userId: string): Promise<ViewBlogDto> {
    return this.commandBus.execute(new CreateBlogCommand(inputBlog, userId));
  }


  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param("id") blogId: string,
                   @Body() inputBlog: InputBlogDto,
                   @CurrentUserId() userId: string): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(blogId, inputBlog, userId));
  }


  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param("id") blogId: string,
                   @CurrentUserId() userId: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(blogId, userId));
  }


  @Get()
  async getAllBlogs(@Query() query,
                    @Pagination() paginationParams: PaginationParams,
                    @CurrentUserId() userId: string): Promise<PaginatorDto<ViewBlogDto[]>> {
    const searchNameTerm = query.searchNameTerm as string || "";
    return this.commandBus.execute(new GetAllBlogsByUserIdCommand(searchNameTerm.trim(), paginationParams, userId));
  }


  @Post(":blogId/posts")
  @HttpCode(HttpStatus.CREATED)
  async createPostByBlogId(@Param("blogId") blogId: string,
                           @Body() inputPost: InputBlogPostDto,
                           @CurrentUserId() userId: string): Promise<ViewPostDto> {
    return this.commandBus.execute(new CreatePostByBlogIdCommand(blogId, userId, inputPost));
  }


  @Delete(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostByBlogIdAndPostId(@Param("blogId") blogId: string,
                                    @Param("postId") postId: string,
                                    @CurrentUserId() userId: string): Promise<void> {
    await this.commandBus.execute(new DeletePostByBlogIdAndPostIdCommand(blogId, postId, userId));
  }


  @Put(":blogId/posts/:postId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePostByBlogIdAndPostId(@Param("blogId") blogId: string,
                                    @Param("postId") postId: string,
                                    @CurrentUserId() userId: string,
                                    @Body() inputPost: InputBlogPostDto): Promise<void> {
    await this.commandBus.execute(new UpdatePostByBlogIdAndPostIdCommand(blogId, postId, userId, inputPost));
  }

  @Get("comments")
  async getAllComments(@Pagination() paginationParams: PaginationParams,
                       @CurrentUserId() ownerId: string) {
    return this.commandBus.execute(new GetAllCommentsForMyBlogsCommand(ownerId,paginationParams));
  }
}

////////////////////////////////////////////

@UseGuards(BaseAuthGuard)
@Controller("sa/blogs")
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus) {
  }

  @Get()
  async getAllBlogs(@Query() query, @Pagination() paginationParams: PaginationParams): Promise<PaginatorDto<ViewBlogDto[]>> {
    const searchNameTerm = query.searchNameTerm as string || "";
    return this.commandBus.execute(new GetAllBlogsCommand(searchNameTerm.trim(), paginationParams, true));
  }


  @Put(":blogId/bind-with-user/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(@Param("blogId") blogId: string, @Param("userId") userId: string): Promise<void> {
    await this.commandBus.execute(new BindBlogWithUserCommand(blogId, userId));
  }


  @Put(":blogId/ban")
  @HttpCode(HttpStatus.NO_CONTENT)
  async banBlog(@Param("blogId") blogId: string,
                @Body() inputBanBlogDto: InputBanBlogDto): Promise<void> {
    await this.commandBus.execute(new BanBlogCommand(blogId, inputBanBlogDto));
  }

}