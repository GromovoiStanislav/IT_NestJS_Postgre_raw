import { CreateBlogDto } from "./create-blog.dto";
import { InputBlogDto } from "./input-blog.dto";
import { ViewBlogDto } from "./view-blog.dto";
import uid from "../../../utils/IdGenerator";
import { PaginatorDto } from "../../../commonDto/paginator.dto";
import { UpdateBlogDto } from "./update-blog.dto";
import dateAt from "../../../utils/DateGenerator";
import { BlogOwnerDto } from "./blog-owner.dto";
import { BanBlogInfo } from "./blog-banInfo.dto";
import { ViewBanBlogUser } from "./view-blog-ban-user.dto";
import { BlogBdDto } from "./blog-bd.dto";
import { BlogBannedUserBdDto } from "./blog-banned-users-bd.dto";

export default class BlogMapper {

  static fromInputToCreate(inputBlog: InputBlogDto, blogOwnerInfo: BlogOwnerDto): CreateBlogDto {
    const createdBlog = new CreateBlogDto();
    createdBlog.id = uid();
    createdBlog.name = inputBlog.name;
    createdBlog.websiteUrl = inputBlog.websiteUrl;
    createdBlog.description = inputBlog.description;
    createdBlog.createdAt = dateAt();
    createdBlog.isBanned= false;
    createdBlog.banDate= null;
    createdBlog.userId = blogOwnerInfo.userId
    createdBlog.userLogin = blogOwnerInfo.userLogin
    return createdBlog;
  }

  static fromInputToUpdate(inputBlog: InputBlogDto): UpdateBlogDto {
    const updatedBlog = new UpdateBlogDto();
    updatedBlog.name = inputBlog.name;
    updatedBlog.websiteUrl = inputBlog.websiteUrl;
    updatedBlog.description = inputBlog.description;
    return updatedBlog;
  }

  static fromModelToView(blog: BlogBdDto, sa: boolean = false): ViewBlogDto {

    const banInfo = new BanBlogInfo()
    banInfo.isBanned = blog.isBanned
    banInfo.banDate = blog.banDate

    const blogOwnerInfo = new BlogOwnerDto()
    blogOwnerInfo.userId = blog.userId
    blogOwnerInfo.userLogin = blog.userLogin

    const viewBlog = new ViewBlogDto();
    viewBlog.id = blog.id;
    viewBlog.name = blog.name;
    viewBlog.websiteUrl = blog.websiteUrl;
    viewBlog.description = blog.description;
    viewBlog.createdAt = blog.createdAt;
    if (sa) {
      viewBlog.blogOwnerInfo = blogOwnerInfo;
      viewBlog.banInfo = banInfo;
    }
    return viewBlog;
  }

  static fromModelsToPaginator(blogs: PaginatorDto<BlogBdDto[]>, withBlogOwner: boolean): PaginatorDto<ViewBlogDto[]> {
    return {
      pagesCount: blogs.pagesCount,
      page: blogs.page,
      pageSize: blogs.pageSize,
      totalCount: blogs.totalCount,
      items: blogs.items.map(blog => BlogMapper.fromModelToView(blog, withBlogOwner))
    };
  }


  static fromBannedUserModelsToPaginator(blogs: PaginatorDto<BlogBannedUserBdDto[]>): PaginatorDto<ViewBanBlogUser[]> {
    return {
      pagesCount: blogs.pagesCount,
      page: blogs.page,
      pageSize: blogs.pageSize,
      totalCount: blogs.totalCount,
      items: blogs.items.map(user => ({
        id: user.userId,
        login: user.login,
        banInfo: {
          isBanned: true,
          banDate: user.createdAt,
          banReason: user.banReason
        }
      }))
    };
  }

}