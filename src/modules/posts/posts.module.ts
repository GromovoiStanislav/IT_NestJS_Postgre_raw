import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import {
  ClearAllPostsUseCase,
  CreatePostByBlogIdUseCase,
  CreatePostUseCase,
  DeletePostByBlogIdAndPostIdUseCase,
  DeletePostUseCase,
  GetAllPostsByBlogIdUseCase,
  GetAllPostsByBlogOwnerIdUseCase,
  GetAllPostsUseCase,
  GetOnePostUseCase,
  GetOnePostWithLikesUseCase,
  PostsUpdateLikeByIDUseCase,
  UpdatePostByBlogIdAndPostIdUseCase,
  UpdatePostUseCase
} from "./posts.service";
import { CqrsModule } from "@nestjs/cqrs";
import { UserIdMiddleware } from "../../middlewares/userId.middleware";
import { JWT_Module } from "../jwt/jwt.module";
import { BlogIdValidator } from "./dto/blogId.validator";
import { PostsPgPawRepository } from "./posts-pg-paw-repository";
import { PostLikesPgPawRepository } from "./post-likess-pg-paw-repository";


const useCases = [
  ClearAllPostsUseCase,
  DeletePostUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  GetOnePostUseCase,
  GetOnePostWithLikesUseCase,
  GetAllPostsUseCase,
  GetAllPostsByBlogIdUseCase,
  CreatePostByBlogIdUseCase,
  PostsUpdateLikeByIDUseCase,
  DeletePostByBlogIdAndPostIdUseCase,
  UpdatePostByBlogIdAndPostIdUseCase,
  GetAllPostsByBlogOwnerIdUseCase,
];

@Module({
  imports: [CqrsModule, JWT_Module],
  controllers: [PostsController],
  providers: [...useCases, PostsPgPawRepository, PostLikesPgPawRepository, BlogIdValidator],
  exports: []
})

export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes("posts");
  }
}