import { BlogOwnerDto } from "./blog-owner.dto";
import { BanBlogInfo } from "./blog-banInfo.dto";

export class CreateBlogDto {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  createdAt: string;
  blogOwnerInfo: BlogOwnerDto;
  banInfo: BanBlogInfo;
}