import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
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
import { CommentsPgPawRepository } from "./comments-pg-paw-repository";
import { CommentLikesPgPawRepository } from "./comment-likes-pg-raw.repository";

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
    JWT_Module
  ],
  controllers: [CommentsController],
  providers: [...useCases, CommentsPgPawRepository, CommentLikesPgPawRepository]
})

export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes("comments");
  }
}