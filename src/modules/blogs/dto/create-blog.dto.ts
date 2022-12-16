
export class CreateBlogDto {
  id: string;
  name: string;
  websiteUrl: string;
  description: string;
  createdAt: string;
  userId: string
  userLogin: string
  isBanned: boolean = false;
  banDate: string = null;
}