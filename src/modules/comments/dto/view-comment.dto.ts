import { LikesInfoDto } from "../../../commonDto/likesInfoDto";

export class ViewCommentDto {
  id: string
  content: string
  userId: string
  userLogin: string
  createdAt: string
  likesInfo: LikesInfoDto
}