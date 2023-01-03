import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostLikeDbDto } from "./dto/post-likes-db.dto";
import { ExtendedLikesInfoDto } from "../../commonDto/extendedLikesInfoDto";
import { LikeDetailsViewDto } from "../../commonDto/likeDetailsViewDto";


@Injectable()
export class PostLikesPgPawRepository {

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."postLikes";
    `);
  }


  async deleteByPostIDUserID(postId: string, userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."postLikes"
    WHERE "postId" = $1 and "userId" = $2;
    `, [postId, userId]);
  }

  async findCommentLike(postId: string, userId: string): Promise<PostLikeDbDto | null> {
    const result = await this.dataSource.query(`
    SELECT "postId", "userId", "userLogin", "likeStatus", "addedAt"
    FROM public."postLikes"
    WHERE "postId"=$1 and "userId"=$2;
    `, [postId, userId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async createCommentLike(postId: string, userId: string, userLogin: string, likeStatus: string): Promise<void> {
    const addedAt = new Date().toISOString();
    await this.dataSource.query(`
    INSERT INTO public."postLikes"(
    "postId", "userId", "userLogin", "likeStatus", "addedAt")
    VALUES ($1, $2, $3, $4, $5);
    `, [
      postId,
      userId,
      userLogin,
      likeStatus,
      addedAt
    ]);
  }


  async updateCommentLike(postId: string, userId: string, userLogin: string, likeStatus: string): Promise<void> {
    const addedAt = new Date().toISOString();
    await this.dataSource.query(`
    UPDATE public."postLikes"
    SET "userLogin"=$3, "likeStatus"=$4, "addedAt"=$5 
    WHERE "postId"=$1 and "userId"=$2;
    `, [
      postId,
      userId,
      userLogin,
      likeStatus,
      addedAt
    ]);
  }

  async likesInfoByPostID(postId: string, userId: string): Promise<ExtendedLikesInfoDto> {
    const result = await this.dataSource.query(`
    WITH not_banned_likes AS ( 
        SELECT "postId", "userId", "likeStatus" FROM public."postLikes"
        WHERE "postId"=$1 and "userId" in (
        SELECT "id"
        FROM public."users"
        WHERE "isBanned" = false
        )
    )
    SELECT 
    (SELECT count(*) FROM not_banned_likes WHERE "likeStatus"='Like') as "likesCount",
    (SELECT count(*) FROM not_banned_likes WHERE "likeStatus"='Dislike') as "dislikesCount",
    (SELECT "likeStatus" FROM public."postLikes" WHERE "postId"=$1 and "userId"=$2 ) as "myStatus";
    `, [postId, userId]);

    if (result.length > 0) {
      return {
        likesCount: +result[0].likesCount,
        dislikesCount: +result[0].dislikesCount,
        myStatus: result[0].myStatus ? result[0].myStatus : "None",
        newestLikes: await this.newestLikes(postId)
      };
    }
    return { likesCount: 0, dislikesCount: 0, myStatus: "None",newestLikes:[] };
  }


  async newestLikes(postId: string): Promise<LikeDetailsViewDto[]> {
    const result = await this.dataSource.query(`
    WITH not_banned_likes AS ( 
        SELECT "userId","userLogin","addedAt" FROM public."postLikes"
        WHERE "postId"=$1 and "likeStatus"='Like' and "userId" in (
        SELECT "id"
        FROM public."users"
        WHERE "isBanned" = false
        )
    )
    SELECT 
    "userId","userLogin","addedAt" 
    FROM not_banned_likes
    ORDER BY "addedAt" DESC
    LIMIT 3;
    `, [postId]);


    return result.map(el => ({
      addedAt: el.addedAt,
      userId: el.userId,
      login: el.userLogin
    }));
  }


}