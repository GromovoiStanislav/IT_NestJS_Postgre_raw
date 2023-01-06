import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostDbDto } from "./dto/posts-db.dto";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";


@Injectable()
export class PostsPgPawRepository {

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }


  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."posts";
    `);
  }


  async deletePost(postId: string): Promise<number> {
    const result = await this.dataSource.query(`
    DELETE FROM public."posts"
    WHERE "id" = $1;
    `, [postId]);
    return result[1];
  }


  async createPost(createPostDto: CreatePostDto): Promise<PostDbDto> {
    const result = await this.dataSource.query(`
    INSERT INTO public."posts"(
    "id", "title", "content", "shortDescription", "blogId", "blogName", "createdAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [
      createPostDto.id,
      createPostDto.title,
      createPostDto.content,
      createPostDto.shortDescription,
      createPostDto.blogId,
      createPostDto.blogName,
      createPostDto.createdAt
    ]);
    return createPostDto;
  }


  async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."posts"
    SET "title"=$2, "content"=$3, "shortDescription"=$4, "blogId"=$5, "blogName"=$6
    WHERE "id" = $1;
    `, [
      postId,
      updatePostDto.title,
      updatePostDto.content,
      updatePostDto.shortDescription,
      updatePostDto.blogId,
      updatePostDto.blogName]);
  }


  ////Доделать передачу массива в запрос
  async getOnePost(postId: string, notBan: boolean = false): Promise<PostDbDto | null> {
    let result;
    if (notBan) {
      result = await this.dataSource.query(`
        SELECT "id", "title", "content", "shortDescription", "blogId", "blogName", "createdAt"
        FROM public."posts"
        WHERE "id" = $1 and "blogId" in (
        SELECT "id"
        FROM public."blogs"
        WHERE "isBanned" = false);
    `, [postId]);

    } else {
      result = await this.dataSource.query(`
        SELECT "id", "title", "content", "shortDescription", "blogId", "blogName", "createdAt"
        FROM public."posts"
        WHERE "id" = $1;
        `, [postId]);

    }

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async getAllPostsByBlogOwnerId(ownerId: string): Promise<PostDbDto[]> {
    return this.dataSource.query(`
    SELECT "id", "title", "content", "shortDescription", "blogId", "blogName", "createdAt"
    FROM public."posts"
    WHERE "blogId" in (
        SELECT "id"
        FROM public."blogs"
        WHERE "userId" = $1
    );
    `, [ownerId]);
  }




  async getAllPosts({
                      pageNumber,
                      pageSize,
                      sortBy,
                      sortDirection
                    }: PaginationParams, blogId: string): Promise<PaginatorDto<PostDbDto[]>> {

    if (!["title", "content", "shortDescription", "blogName", "createdAt"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";

    let filter = "";
    if (blogId) {
      filter = `WHERE "blogId" = '${blogId}'`;
    }

    const items = await this.dataSource.query(`
    SELECT "id", "title", "content", "shortDescription", "blogId", "blogName", "createdAt"
    FROM public."posts"
    ${filter}
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `);


    let totalCount = 0;
    const resultCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."posts"
    ${filter};
    `);
    if (resultCount.length > 0) {
      totalCount = +resultCount[0].count;
    }


    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


}