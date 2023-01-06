import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { InputCommentDto } from "./dto/input-comment.dto";
import CommentsMapper from "./dto/commentsMapper";
import { GetOnePostCommand } from "../posts/posts.service";
import { GetUserByIdCommand } from "../users/users.service";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { IsUserBannedForBlogCommand } from "../blogs/blogs.service";
import { CommentsPgPawRepository } from "./comments-pg-paw-repository";
import { CommentLikesPgPawRepository } from "./comment-likes-pg-raw.repository";



//////////////////////////////////////////////////
export class ClearAllCommentsCommand {
}

@CommandHandler(ClearAllCommentsCommand)
export class ClearAllCommentsUseCase implements ICommandHandler<ClearAllCommentsCommand> {
  constructor(
    protected commentsRepository: CommentsPgPawRepository,
    protected commentLikesRepository: CommentLikesPgPawRepository
  ) {
  }

  async execute(command: ClearAllCommentsCommand) {
    await Promise.all([
      await this.commentsRepository.clearAll(),
      await this.commentLikesRepository.clearAll()
    ]).catch(() => {
    });
  }
}

//////////////////////////////////////////////////////////////
export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(protected commentsRepository: CommentsPgPawRepository) {
  }

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findComment(command.commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    if (comment.userId !== command.userId) {
      throw new ForbiddenException();
    }
    await this.commentsRepository.deleteComment(command.commentId);
  }
}


//////////////////////////////////////////////////////////////
export class UpdateCommentCommand {
  constructor(public commentId: string, public userId: string, public inputComment: InputCommentDto) {
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(protected commentsRepository: CommentsPgPawRepository) {
  }

  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findComment(command.commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    if (comment.userId !== command.userId) {
      throw new ForbiddenException();
    }
    await this.commentsRepository.updateComment(command.commentId, CommentsMapper.fromInputToUpdate(command.inputComment));
  }
}


//////////////////////////////////////////////////////////////
export class UpdateCommentLikeCommand {
  constructor(public commentId: string, public userId: string, public likeStatus: string) {
  }
}

@CommandHandler(UpdateCommentLikeCommand)
export class UpdateCommentLikeUseCase implements ICommandHandler<UpdateCommentLikeCommand> {
  constructor(
    protected commentsRepository: CommentsPgPawRepository,
    protected commentLikesRepository: CommentLikesPgPawRepository
  ) {
  }

  async execute(command: UpdateCommentLikeCommand): Promise<void> {
    const comment = await this.commentsRepository.findComment(command.commentId);
    if (!comment) {
      throw new NotFoundException();
    }
    if (command.likeStatus === "None") {
      await this.commentLikesRepository.deleteCommentLike(command.commentId, command.userId);
    } else {
      if (await this.commentLikesRepository.findCommentLike(command.commentId, command.userId)) {
        await this.commentLikesRepository.updateCommentLike(command.commentId, command.userId, command.likeStatus);
      } else {
        await this.commentLikesRepository.createCommentLike(command.commentId, command.userId, command.likeStatus);
      }
    }
  }
}


//////////////////////////////////////////////////////////////
export class GetCommentCommand {
  constructor(public commentId: string, public userId: string) {
  }
}

@CommandHandler(GetCommentCommand)
export class GetCommentUseCase implements ICommandHandler<GetCommentCommand> {
  constructor(
    private commandBus: CommandBus,
    protected commentsRepository: CommentsPgPawRepository
  ) {
  }

  async execute(command: GetCommentCommand) {
    const comment = await this.commentsRepository.findCommentWithLikes(command.commentId, command.userId);//findComment
    if (!comment) {
      throw new NotFoundException();
    }

    const user = await this.commandBus.execute(new GetUserByIdCommand(comment.userId));
    if (!user || user.isBanned) {
      throw new NotFoundException();
    }

    const likesInfo =  {
      likesCount: +comment.likesCount,
      dislikesCount: +comment.dislikesCount,
      myStatus: comment.myStatus ? comment.myStatus : "None"
    }
    return CommentsMapper.fromModelToView(comment, likesInfo);

  }
}


//////////////////////////////////////////////////////////////
export class CreateCommentByPostIDCommand {
  constructor(public postId: string, public userId: string, public inputComment: InputCommentDto) {
  }
}

@CommandHandler(CreateCommentByPostIDCommand)
export class CreateCommentByPostIDUseCase implements ICommandHandler<CreateCommentByPostIDCommand> {
  constructor(
    private commandBus: CommandBus,
    protected commentsRepository: CommentsPgPawRepository
  ) {
  }

  async execute(command: CreateCommentByPostIDCommand) {
    const post = await this.commandBus.execute(new GetOnePostCommand(command.postId));
    if (!post) {
      throw new NotFoundException();
    }

    if (await this.commandBus.execute(new IsUserBannedForBlogCommand(post.blogId, command.userId))) {
      throw new ForbiddenException();
    }

    const user = await this.commandBus.execute(new GetUserByIdCommand(command.userId));

    const createCommentDto = CommentsMapper.fromInputToCreate(command.postId, command.inputComment, command.userId, user.login);
    const comment = await this.commentsRepository.createComment(createCommentDto);

    return CommentsMapper._fromModelToView(comment);
  }
}


/////////////////////////////////////////////
export class GetAllCommentsByPostIDCommand {
  constructor(public paginationParams: PaginationParams, public postId: string, public userId: string) {
  }
}

@CommandHandler(GetAllCommentsByPostIDCommand)
export class GetAllCommentsByPostIDUseCase implements ICommandHandler<GetAllCommentsByPostIDCommand> {
  constructor(
    private commandBus: CommandBus,
    protected commentsRepository: CommentsPgPawRepository,
    protected commentLikesRepository: CommentLikesPgPawRepository
  ) {
  }


  async execute(command: GetAllCommentsByPostIDCommand) {

    const post = await this.commandBus.execute(new GetOnePostCommand(command.postId));
    if (!post) {
      throw new NotFoundException();
    }

    const result = await this.commentsRepository.getAllComments(command.paginationParams, command.postId);

    const commentIds = result.items.map(comment => comment.id);
    const likesArr = await this.commentLikesRepository.likesByCommentID(commentIds, command.userId);

    const items=[]
    for (const comment of result.items) {
      let likes = likesArr.find(i=> i.commentId===comment.id)
      if(!likes){
        likes = { likesCount: 0, dislikesCount: 0, myStatus: "None" }
      }
      items.push(CommentsMapper.fromModelToView(comment, likes));
    }

    return { ...result, items };
  }
}


/////////////////////////////////////////////
export class GetAllCommentsByArrayOfPostIDCommand {
  constructor(public paginationParams: PaginationParams, public postsIds: string[], public userId: string) {
  }
}

@CommandHandler(GetAllCommentsByArrayOfPostIDCommand)
export class GetAllCommentsByArrayOfPostIDUseCase implements ICommandHandler<GetAllCommentsByArrayOfPostIDCommand> {
  constructor(
    protected commentsRepository: CommentsPgPawRepository,
    protected commentLikesRepository: CommentLikesPgPawRepository
  ) {
  }

  async execute(command: GetAllCommentsByArrayOfPostIDCommand) {

    const result = await this.commentsRepository.getAllCommentsByArrayOfPosts(command.paginationParams, command.postsIds);

    const commentIds = result.items.map(comment => comment.id);
    const likesArr = await this.commentLikesRepository.likesByCommentID(commentIds, command.userId);

    const items=[]
    for (const comment of result.items) {
      let likes = likesArr.find(i=> i.commentId===comment.id)
      if(!likes){
        likes = { likesCount: 0, dislikesCount: 0, myStatus: "None" }
      }
      items.push(CommentsMapper.fromModelToOwnerView(comment, likes));
    }

    return { ...result, items };
  }
}









