import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { BlogBdDto } from "./dto/blog-bd.dto";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { BlogOwnerDto } from "./dto/blog-owner.dto";
import { BanBlogInfo } from "./dto/blog-banInfo.dto";
import { CreateBlogBanUserDto } from "./dto/create-blog-ban-user.dto";
import { BlogBannedUserBdDto } from "./dto/blog-banned-users-bd.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";


@Injectable()
export class BlogsPgPawRepository {

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }


  async clearAll(): Promise<void> {

    await Promise.all([
      await this.dataSource.query(`
        DELETE FROM public."blogs";
        `),
      await this.dataSource.query(`
        DELETE FROM public."blogBannedUsers";
        `)
    ]);
  }


  async getAllBlogs(searchName: string, {
                      pageNumber,
                      pageSize,
                      sortBy,
                      sortDirection
                    }: PaginationParams,
                    includeBanned: boolean,
                    userId?: string): Promise<PaginatorDto<BlogBdDto[]>> {

    if (!["name", "websiteUrl", "description", "createdAt", "userLogin"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";

    let filter = `WHERE 1=1`;
    if (!includeBanned) {
      filter = filter + ` and "isBanned" = false`;
    }
    if (userId) {
      filter = filter + ` and "userId" = '${userId}'`;
    }
    if (searchName) {
      filter = filter + ` and "name" ~* '${searchName}'`;
    }

    const items = await this.dataSource.query(`
    SELECT "id", "name", "websiteUrl", "description", "createdAt", "userId", "userLogin", "isBanned", "banDate"
    FROM public."blogs"
    ${filter}
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `);


    let totalCount = 0;
    const resultCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."blogs"
    ${filter};
    `);
    if (resultCount.length > 0) {
      totalCount = +resultCount[0].count;
    }

    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


  async deleteBlog(blogId: string): Promise<number> {
    const result = await this.dataSource.query(`
    DELETE FROM public."blogs"
    WHERE "id" = $1;
    `, [blogId]);
    return result[1];
  }


  async getOneBlog(blogId: string): Promise<BlogBdDto | null> {
    const result = await this.dataSource.query(`
    SELECT "id", "name", "websiteUrl", "description", "createdAt", "userId", "userLogin", "isBanned", "banDate"
    FROM public."blogs"
    WHERE "id"=$1 and "isBanned"=false;
    `, [blogId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async createBlog(createBlogDto: CreateBlogDto): Promise<BlogBdDto> {
    const result = await this.dataSource.query(`
    INSERT INTO public."blogs"(
    "id", "name", "websiteUrl", "description", "createdAt", "userId", "userLogin", "isBanned", "banDate")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [
      createBlogDto.id,
      createBlogDto.name,
      createBlogDto.websiteUrl,
      createBlogDto.description,
      createBlogDto.createdAt,
      createBlogDto.userId,
      createBlogDto.userLogin,
      createBlogDto.isBanned,
      createBlogDto.banDate
    ]);
    return createBlogDto;
  }


  async updateBlog(blogId: string, updateBlogDto: UpdateBlogDto): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."blogs"
    SET "name"=$2, "websiteUrl"=$3, "description"=$4
    WHERE "id" = $1;
    `, [blogId, updateBlogDto.name, updateBlogDto.websiteUrl, updateBlogDto.description]);
  }


  async bindBlogWithUser(blogId: string, blogOwner: BlogOwnerDto): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."blogs"
    SET "userId"=$2, "userLogin"=$3
    WHERE "id" = $1;
    `, [blogId, blogOwner.userId, blogOwner.userLogin]);
  }


  async banBlog(blogId: string, banInfo: BanBlogInfo): Promise<void> {
    await this.dataSource.query(`
    UPDATE public."blogs"
    SET "isBanned"=$2, "banDate"=$3
    WHERE "id" = $1;
    `, [blogId, banInfo.isBanned, banInfo.banDate]);
  }


  async getBanedBlogs(): Promise<BlogBdDto[]> {
    return await this.dataSource.query(`
    SELECT "id", "name", "websiteUrl", "description", "createdAt", "userId", "userLogin", "isBanned", "banDate"
    FROM public."blogs"
    WHERE "isBanned" = true;
    `);
  }


  //////////////////////////////////////////////////////

  async banUserForBlog(createBlogBanUserDto: CreateBlogBanUserDto): Promise<void> {
    await this.dataSource.query(`
    INSERT INTO public."blogBannedUsers"(
    "blogId", "userId", "login", "createdAt", "banReason")
    VALUES ($1, $2, $3, $4, $5);
    `, [
      createBlogBanUserDto.blogId,
      createBlogBanUserDto.userId,
      createBlogBanUserDto.login,
      createBlogBanUserDto.createdAt,
      createBlogBanUserDto.banReason
    ]);

  }

  async unbanUserForBlog(userId: string, blogId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."blogBannedUsers"
    WHERE "userId" = $1 and "blogId" = $2;
    `, [userId, blogId]);

  }

  async findBannedUserForBlog(blogId: string, userId: string): Promise<BlogBannedUserBdDto | null> {
    const result = await this.dataSource.query(`
    SELECT "blogId", "userId", "login", "createdAt", "banReason"
    FROM public."blogBannedUsers"
    WHERE "blogId" = $1 and "userId" = $2;
    `, [blogId, userId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }


  async getAllBannedUsersForBlog(
    blogId: string,
    searchLogin: string,
    {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    }: PaginationParams): Promise<PaginatorDto<BlogBannedUserBdDto[]>> {

    if (!["login", "banReason", "createdAt"].includes(sortBy)) {
      sortBy = "createdAt";
    }
    const order = sortDirection === "asc" ? "ASC" : "DESC";

    let filter = `WHERE "blogId" = $1`;
    if (searchLogin) {
      filter = filter + ` and "login" ~* '${searchLogin}'`;
    }

    const items = await this.dataSource.query(`
    SELECT "blogId", "userId", "login", "createdAt", "banReason"
    FROM public."blogBannedUsers"
    ${filter}
    ORDER BY "${sortBy}" COLLATE "C" ${order}
    LIMIT ${pageSize} OFFSET ${(pageNumber - 1) * pageSize};
    `, [blogId]);


    let totalCount = 0;
    const resultCount = await this.dataSource.query(`
    SELECT COUNT(*)
    FROM public."blogBannedUsers"
    ${filter};
    `, [blogId]);
    if (resultCount.length > 0) {
      totalCount = +resultCount[0].count;
    }

    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


}