import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument } from "./schemas/blogs.schema";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { BlogOwnerDto } from "./dto/blog-owner.dto";
import { BanBlogInfo } from "./dto/blog-banInfo.dto";
import { BlogBannedUsersDocument, BlogBanUser } from "./schemas/blogBannedUsers.schema";
import { CreateBlogBanUserDto } from "./dto/create-blog-ban-user.dto";


@Injectable()
export class BlogsRepository {

  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(BlogBanUser.name) private blogBannedUsersModel: Model<BlogBannedUsersDocument>) {
  }


  async clearAll(): Promise<void> {
    await this.blogModel.deleteMany({});
    await this.blogBannedUsersModel.deleteMany({});
  }


  async deleteBlog(blogId: string): Promise<Blog | null> {
    return this.blogModel.findOneAndDelete({ id: blogId });
  }


  async createBlog(createBlogDto: CreateBlogDto): Promise<Blog> {
    const createdBlog = new this.blogModel(createBlogDto);
    return await createdBlog.save();
  }


  async updateBlog(blogId: string, updateBlogDto: UpdateBlogDto): Promise<Blog | null> {
    return this.blogModel.findOneAndUpdate({ id: blogId }, updateBlogDto);
  }

  async bindBlogWithUser(blogId: string, blogOwner: BlogOwnerDto): Promise<Blog | null> {
    return this.blogModel.findOneAndUpdate({ id: blogId }, { blogOwnerInfo: blogOwner });
  }


  async getOneBlog(blogId: string): Promise<Blog | null> {
    return this.blogModel.findOne({ id: blogId, "banInfo.isBanned": false });
  }


  async getAllBlogs(searchName: string, {
                      pageNumber,
                      pageSize,
                      sortBy,
                      sortDirection
                    }: PaginationParams,
                    includeBanned: boolean,
                    userId?: string): Promise<PaginatorDto<Blog[]>> {

    type FilterType = {
      [key: string]: unknown
    }
    const filter: FilterType = {};
    if (searchName) {
      filter.name = RegExp(`${searchName}`, "i");
    }
    if (userId) {
      filter["blogOwnerInfo.userId"] = userId;
    }

    if (!includeBanned) {
      filter["banInfo.isBanned"] = false;
    }


    const items = await this.blogModel.find(filter).sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .limit(pageSize).skip((pageNumber - 1) * pageSize);

    const totalCount = await this.blogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }

  async banBlog(blogId: string, banInfo: BanBlogInfo): Promise<void> {
    await this.blogModel.findOneAndUpdate({ id: blogId }, { banInfo });
  }

  async getBanedBlogs(): Promise<Blog[]> {
    return this.blogModel.find({ "banInfo.isBanned": true });
  }


  async banUserForBlog(createBlogBanUserDto: CreateBlogBanUserDto): Promise<void> {
    const createdBan = new this.blogBannedUsersModel(createBlogBanUserDto);
    await createdBan.save();
  }

  async unbanUserForBlog(userId: string, blogId: string): Promise<void> {
    await this.blogBannedUsersModel.findOneAndDelete({ userId, blogId });
  }

  async getAllBannedUsersForBlog(
    blogId: string,
    searchLogin: string,
    {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    }: PaginationParams): Promise<PaginatorDto<BlogBanUser[]>> {

    type FilterType = {
      [key: string]: unknown
    }
    const filter: FilterType = {};
    filter.blogId = blogId;
    if (searchLogin) {
      filter.userLogin = RegExp(`${searchLogin}`, "i");
    }

    const items = await this.blogBannedUsersModel.find(filter).sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .limit(pageSize).skip((pageNumber - 1) * pageSize);

    const totalCount = await this.blogBannedUsersModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


  async findBannedUserForBlog(blogId: string, userId: string): Promise<BlogBanUser | null> {
    return this.blogBannedUsersModel.findOne({ blogId, userId  });
  }

  async getAllBlogsByOwnerId(ownerId: string): Promise<Blog[]> {
    return this.blogModel.find({ "blogOwnerInfo.userId": ownerId });
  }

}