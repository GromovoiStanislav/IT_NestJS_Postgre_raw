import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { LikesInfoDto } from "../../commonDto/likesInfoDto";


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

  async deleteByCommentIDUserID(commentId: string, userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."commentLikes"
    WHERE "commentId"=$1 and "userId"=$2;
    `, [commentId, userId]);
  }


  async updateLikeByID(commentId: string, userId: string, likeStatus: string): Promise<void> {
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