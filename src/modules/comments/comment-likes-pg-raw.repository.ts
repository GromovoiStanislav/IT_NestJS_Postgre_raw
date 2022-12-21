import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentLikeDbDto } from "./dto/comment-likes-db.dto";


@Injectable()
export class CommentLikesPgPawRepository {

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }

  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."commentLikes";
    `);
  }

  async deleteCommentLike(commentId: string, userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."commentLikes"
    WHERE "commentId"=$1 and "userId"=$2;
    `, [commentId, userId]);
  }


  async findCommentLike(commentId: string, userId: string): Promise<CommentLikeDbDto | null> {
    const result = await this.dataSource.query(`
    SELECT "commentId", "userId", "likeStatus"
    FROM public."commentLikes"
    WHERE "commentId"=$1 and "userId"=$2;
    `, [commentId,userId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async createCommentLike(commentId: string, userId: string, likeStatus: string): Promise<void> {
    await this.dataSource.query(`
    INSERT INTO public."commentLikes"(
    "commentId", "userId", "likeStatus")
    VALUES ($1, $2, $3);
    `, [
      commentId,
      userId,
      likeStatus,
    ]);

  }


  async updateCommentLike(commentId: string, userId: string, likeStatus: string): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."commentLikes"
    SET "likeStatus"=$3
    WHERE "commentId"=$1 and "userId"=$2;
    `, [
      commentId,
      userId,
      likeStatus
    ]);
  }



  //async likesByCommentID(commentId: string, userId: string, banUsersId: string[]): Promise<LikesInfoDto> {
   // return { likesCount, dislikesCount, myStatus };
  //}


}