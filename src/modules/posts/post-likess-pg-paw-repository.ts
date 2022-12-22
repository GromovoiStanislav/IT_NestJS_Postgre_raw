import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostLikeDbDto } from "./dto/post-likes-db.dto";

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
    WHERE "postId" = $1 and "postId" = $2;
    `, [postId, userId]);
  }

  async findCommentLike(postId: string, userId: string): Promise<PostLikeDbDto | null> {
    const result = await this.dataSource.query(`
    SELECT "postLikes", "userId", "userLogin", "likeStatus", "addedAt"
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
    "postLikes", "userId", "userLogin", "likeStatus", "addedAt")
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
    UPDATE public."commentLikes"
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


}