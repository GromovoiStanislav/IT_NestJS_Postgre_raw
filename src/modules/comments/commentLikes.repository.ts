import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentLike, CommentLikeDocument } from "./schemas/comment-likes.schema";
import { LikesInfoDto } from "../../commonDto/likesInfoDto";

@Injectable()
export class CommentLikesRepository {

  constructor(@InjectModel(CommentLike.name) private commentLikesModel: Model<CommentLikeDocument>) {
  }

  async clearAll(): Promise<void> {
    await this.commentLikesModel.deleteMany({});
  }

  async deleteByCommentIDUserID(commentId: string, userId: string): Promise<void> {
    await this.commentLikesModel.deleteMany({ commentId, userId });
  }

  async updateLikeByID(commentId: string, userId: string, likeStatus: string): Promise<void> {
    await this.commentLikesModel.findOneAndUpdate(
      { commentId, userId },
      { likeStatus },
      { upsert: true }
    );

  }

  async likesByCommentID(commentId: string, userId: string, banUsersId: string[]): Promise<LikesInfoDto> {
    const likesCount = await this.commentLikesModel.count({ commentId, likeStatus: "Like", userId: { $nin: banUsersId } });
    const dislikesCount = await this.commentLikesModel.count({
      commentId,
      likeStatus: "Dislike",
      userId: { $nin: banUsersId }
    });
    let myStatus = "None";
    if (userId) {
      const doc = await this.commentLikesModel.findOne({ commentId, userId });
      if (doc) {
        myStatus = doc.likeStatus;
      }
    }
    return { likesCount, dislikesCount, myStatus };
  }


}