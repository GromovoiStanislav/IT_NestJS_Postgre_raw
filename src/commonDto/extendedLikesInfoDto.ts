import { LikeDetailsViewDto } from "./likeDetailsViewDto";

export class ExtendedLikesInfoDto {
  likesCount: number = 0;
  dislikesCount: number = 0;
  myStatus: string = "None";
  newestLikes: LikeDetailsViewDto[]=[];
}