import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostLike, PostLikeDocument } from "./schemas/post-likes.schema";


@Injectable()
export class PostLikesRepository {

  constructor(@InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>) {
  }


  async clearAll(): Promise<void> {
    await this.postLikeModel.deleteMany({});
  }

  async deleteByPostIDUserID(postId: string, userId: string): Promise<void> {
    await this.postLikeModel.deleteMany({ postId, userId });
  }


  async updateLikeByID(postId: string, userId: string, userLogin: string, likeStatus: string): Promise<void> {
    const addedAt = new Date().toISOString();
    await this.postLikeModel.findOneAndUpdate({ postId, userId },
      {
        likeStatus,
        userLogin,
        addedAt
      }, { upsert: true });
  }

  //: Promise<ExtendedLikesInfoViewModel>
  async likesInfoByPostID(postId: string, userId: string, banUsersId: string[]) {

    const likesCount = await this.postLikeModel.countDocuments({
      postId,
      likeStatus: "Like",
      userId: { $nin: banUsersId }
    });
    const dislikesCount = await this.postLikeModel.countDocuments({
      postId,
      likeStatus: "Dislike",
      userId: { $nin: banUsersId }
    });
    let myStatus = "None";
    if (userId) {
      const doc = await this.postLikeModel.findOne({ postId, userId });
      if (doc) {
        myStatus = doc.likeStatus;
      }
    }
    return {
      likesCount, dislikesCount, myStatus,
      newestLikes: await this.newestLikes(postId, 3, banUsersId)
    };
  }


  //: Promise<LikesDetailsViewModel[]>
  async newestLikes(postId: string, limit: number, banUsersId) {
    const result = await this.postLikeModel.find({
      postId,
      likeStatus: "Like",
      userId: { $nin: banUsersId }
    }).limit(limit).sort({ addedAt: -1 });
    return result.map(el => ({
      addedAt: el.addedAt,
      userId: el.userId,
      login: el.userLogin
    }));
  }


}