import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { MongooseModule } from "@nestjs/mongoose";
import { Comment, CommentSchema } from "./schemas/comments.schema";
import { CommentLike, CommentLikeSchema } from "./schemas/comment-likes.schema";
import { CommentsRepository } from "./comments.repository";
import { CommentLikesRepository } from "./commentLikes.repository";
import {
  ClearAllCommentsUseCase, CreateCommentByPostIDUseCase,
  DeleteCommentUseCase, GetAllCommentsByArrayOfPostIDUseCase, GetAllCommentsByPostIDUseCase,
  GetCommentUseCase,
  UpdateCommentLikeUseCase,
  UpdateCommentUseCase
} from "./comments.service";
import { UserIdMiddleware } from "../../middlewares/userId.middleware";
import { CommentsController } from "./comments.controller";
import { JWT_Module } from "../jwt/jwt.module";

const useCases = [
  ClearAllCommentsUseCase,
  DeleteCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeUseCase,
  GetCommentUseCase,
  CreateCommentByPostIDUseCase,
  GetAllCommentsByPostIDUseCase,
  GetAllCommentsByArrayOfPostIDUseCase
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema }
    ]),
    JWT_Module
  ],
  controllers: [CommentsController],
  providers: [...useCases, CommentsRepository, CommentLikesRepository]
})

export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes("comments");
  }
}