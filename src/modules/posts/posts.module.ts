import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostsController } from "./posts.controller";
import {
  ClearAllPostsUseCase, CreatePostByBlogIdUseCase,
  CreatePostUseCase, DeletePostByBlogIdAndPostIdUseCase,
  DeletePostUseCase, GetAllPostsByArrayOfBlogIdUseCase, GetAllPostsByBlogIdUseCase,
  GetAllPostsUseCase,
  GetOnePostUseCase, GetOnePostWithLikesUseCase, PostsUpdateLikeByIDUseCase, UpdatePostByBlogIdAndPostIdUseCase,
  UpdatePostUseCase
} from "./posts.service";
import { PostsRepository } from "./posts.repository";
import { Post, PostSchema } from "./schemas/posts.schema";
import { CqrsModule } from "@nestjs/cqrs";
import { PostLike, PostLikeSchema } from "./schemas/post-likes.schema";
import { PostLikesRepository } from "./postLikes.repository";
import { UserIdMiddleware } from "../../middlewares/userId.middleware";
import { JWT_Module } from "../jwt/jwt.module";
import { BlogIdValidator } from "./dto/blogId.validator";


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
  GetAllPostsByArrayOfBlogIdUseCase
];

@Module({
  imports: [CqrsModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema }
    ]),
    JWT_Module],
  controllers: [PostsController],
  providers: [...useCases, PostsRepository, PostLikesRepository, BlogIdValidator],
  exports:[]
})

export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes('posts');
  }
}