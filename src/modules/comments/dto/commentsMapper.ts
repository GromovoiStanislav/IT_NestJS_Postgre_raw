import { InputCommentDto } from "./input-comment.dto";
import { UpdateCommentDto } from "./update-comment.dto";
import { ViewCommentDto } from "./view-comment.dto";
import { LikesInfoDto } from "../../../commonDto/likesInfoDto";
import uid from "../../../utils/IdGenerator";
import dateAt from "../../../utils/DateGenerator";
import { CreateCommentDto } from "./create-comment.dto";
import { CommentDbDto } from "./comments-db.dto";

export default class CommentsMapper {

  static fromInputToUpdate(inputComment: InputCommentDto): UpdateCommentDto {
    const updatedComment = new UpdateCommentDto();
    updatedComment.content = inputComment.content;
    return updatedComment;
  }

  static fromInputToCreate(postId: string, data: InputCommentDto, userId: string, userLogin: string): CreateCommentDto {
    const createdComment = new CreateCommentDto();
    createdComment.id = uid();
    createdComment.postId = postId;
    createdComment.content = data.content;
    createdComment.userId = userId;
    createdComment.userLogin = userLogin;
    createdComment.createdAt = dateAt();
    return createdComment;
  }


  static fromModelToView(comment: CommentDbDto, likes: LikesInfoDto): ViewCommentDto {

    delete likes.commentId

    const viewComment = new ViewCommentDto();
    viewComment.id = comment.id;
    viewComment.content = comment.content;
    viewComment.userId = comment.userId;
    viewComment.userLogin = comment.userLogin;
    viewComment.createdAt = comment.createdAt;
    viewComment.likesInfo = likes;
    return viewComment;
  }


  static _fromModelToView(comment: CommentDbDto): ViewCommentDto {
    const viewComment = new ViewCommentDto();
    viewComment.id = comment.id;
    viewComment.content = comment.content;
    viewComment.userId = comment.userId;
    viewComment.userLogin = comment.userLogin;
    viewComment.createdAt = comment.createdAt;
    viewComment.likesInfo = new LikesInfoDto();
    return viewComment;
  }


  static fromModelToOwnerView(comment: CommentDbDto, likes: LikesInfoDto) {

    delete likes.commentId

    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      createdAt: comment.createdAt,
      postId: comment.postId,
      likesInfo: likes,
    };
  }


}