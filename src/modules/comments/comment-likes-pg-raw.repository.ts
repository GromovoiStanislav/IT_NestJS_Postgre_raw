import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentLikeDbDto } from "./dto/comment-likes-db.dto";
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
    `, [commentId, userId]);

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
      likeStatus
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




  async likesByCommentID(commentIds: string[], userId: string): Promise<LikesInfoDto[]> {

    try {

      const result = await this.dataSource.query(`
    WITH "not_banned_likes" AS (
    SELECT "commentId", "likeStatus"
    FROM public."commentLikes"
    WHERE "commentId" = ANY ($1) AND "userId" in (
         SELECT "id"
         FROM public."users"
         WHERE "isBanned" = false
         )
    )
    SELECT 
    "commentId",
    (SELECT count(*) FROM not_banned_likes WHERE "likeStatus"='Like' AND "commentId"=nb."commentId") as "likesCount",
    (SELECT count(*) FROM not_banned_likes WHERE "likeStatus"='Dislike' AND "commentId"=nb."commentId") as "dislikesCount",
    (SELECT "likeStatus" FROM public."commentLikes" WHERE "commentId"=nb."commentId" AND "userId"=$2 LIMIT 1) as "myStatus"
     FROM "not_banned_likes" as nb;
    `, [commentIds, userId]);

      return result.map(i => ({
          commentId: i.commentId,
          likesCount: +i.likesCount,
          dislikesCount: +i.dislikesCount,
          myStatus: i.myStatus ? i.myStatus : "None"
        }
      ));

    } catch (e) {
      return [];
    }


  }


}