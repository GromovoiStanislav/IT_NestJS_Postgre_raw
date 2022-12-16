import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { BloggerBlogsController, BlogsController, SaBlogsController } from "./blogs.controller";
import {
  BanBlogUseCase,
  BanUserForBlogUseCase,
  BindBlogWithUserUseCase,
  ClearAllBlogsUseCase,
  CreateBlogUseCase,
  DeleteBlogUseCase,
  GetAllBlogsByUserIdUseCase,
  GetAllBlogsUseCase, GetAllCommentsForMyBlogsUseCase,
  GetIdBannedBlogsUseCase,
  GetOneBlogUseCase, IsUserBannedForBlogUseCase,
  ReturnAllBannedUsersForBlogUseCase,
  UpdateBlogUseCase
} from "./blogs.service";
import { CqrsModule } from "@nestjs/cqrs";
import { JWT_Module } from "../jwt/jwt.module";
import { UserIdMiddleware } from "../../middlewares/userId.middleware";
import { BlogsPgPawRepository } from "./blogs-pg-raw.repository";


const useCases = [
  ClearAllBlogsUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  GetOneBlogUseCase,
  GetAllBlogsUseCase,
  BindBlogWithUserUseCase,
  GetAllBlogsByUserIdUseCase,
  BanBlogUseCase,
  GetIdBannedBlogsUseCase,
  BanUserForBlogUseCase,
  ReturnAllBannedUsersForBlogUseCase,
  IsUserBannedForBlogUseCase,
  GetAllCommentsForMyBlogsUseCase
];

@Module({
  imports: [CqrsModule, JWT_Module],
  controllers: [BlogsController, BloggerBlogsController, SaBlogsController],
  providers: [...useCases, BlogsPgPawRepository],
  exports: []
})
export class BlogsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes('blogger/blogs');
  }
}