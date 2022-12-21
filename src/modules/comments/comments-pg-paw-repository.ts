import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentDbDto } from "./dto/comments-db.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";



@Injectable()
export class CommentsPgPawRepository {

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }


  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."comments";
    `);
  }


  async deleteComment(commentId: string): Promise<number> {
    const result = await this.dataSource.query(`
    DELETE FROM public."comments"
    WHERE "id" = $1;
    `, [commentId]);
    return result[1];
  }


  async findComment(commentId: string): Promise<CommentDbDto | null> {
    const result = await this.dataSource.query(`
    SELECT "id", "postId", "content", "userId", "userLogin", "createdAt"
    FROM public."comments"
    WHERE "id" = $1;
    `, [commentId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."comments"
    SET "content"=$2
    WHERE "id" = $1;
    `, [
      commentId,
      updateCommentDto.content
    ]);
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<CommentDbDto> {
    const result = await this.dataSource.query(`
    INSERT INTO public."comments"(
    "id", "postId", "content", "userId", "userLogin", "createdAt")
    VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      createCommentDto.id,
      createCommentDto.postId,
      createCommentDto.content,
      createCommentDto.userId,
      createCommentDto.userLogin,
      createCommentDto.createdAt
    ]);
    return createCommentDto;
  }


  async getAllComments({
                         pageNumber,
                         pageSize,
                         sortBy,
                         sortDirection
                       }: PaginationParams, postId: string): Promise<PaginatorDto<CommentDbDto[]>> {


    if (!["content", "userLogin", "createdAt"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";


    const items = await this.dataSource.query(`
    SELECT "id", "postId", "content", "userId", "userLogin", "createdAt"
    FROM public."comments"
    WHERE "postId" = $1
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `, [postId]);


    let totalCount = 0;
    const resultCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."comments"
    WHERE "postId" = $1;
   `, [postId]);
    if (resultCount.length > 0) {
      totalCount = +resultCount[0].count;
    }

    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


  ////Доделать передачу массива в запрос
  async getAllCommentsByArrayOfPosts({
                                       pageNumber,
                                       pageSize,
                                       sortBy,
                                       sortDirection
                                     }: PaginationParams, postsId: string[]): Promise<PaginatorDto<CommentDbDto[]>> {


    if (!["content", "userLogin", "createdAt"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";


    const items = await this.dataSource.query(`
    SELECT "id", "postId", "content", "userId", "userLogin", "createdAt"
    FROM public."comments"
    WHERE "postId" in ($1)
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `, [postsId]);


    let totalCount = 0;
    const resultCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."comments"
    WHERE "postId" in ($1);
   `, [postsId]);
    if (resultCount.length > 0) {
      totalCount = +resultCount[0].count;
    }


    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


}