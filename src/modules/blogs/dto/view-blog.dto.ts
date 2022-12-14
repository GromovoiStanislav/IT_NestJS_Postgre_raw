import { BlogOwnerDto } from "./blog-owner.dto";
import { BanBlogInfo } from "./blog-banInfo.dto";

export class ViewBlogDto {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  createdAt: string;
  blogOwnerInfo?: BlogOwnerDto;
  banInfo?: BanBlogInfo;
}