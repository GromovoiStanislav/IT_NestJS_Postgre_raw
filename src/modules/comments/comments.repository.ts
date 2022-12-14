import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "./schemas/comments.schema";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";


@Injectable()
export class CommentsRepository {

  constructor(@InjectModel(Comment.name) private commentsModel: Model<CommentDocument>) {
  }

  async clearAll(): Promise<void> {
    await this.commentsModel.deleteMany({});
  }

  async deleteComment(commentId: string): Promise<Comment | null> {
    return this.commentsModel.findOneAndDelete({ id: commentId });
  }

  async findComment(commentId: string): Promise<Comment | null> {
    return this.commentsModel.findOne({ id: commentId });
  }

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto): Promise<Comment | null> {
    return this.commentsModel.findOneAndUpdate({ id: commentId }, updateCommentDto);
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<Comment> {
    const createdComment = new this.commentsModel(createCommentDto);
    return await createdComment.save();
  }


  async getAllComments({
                      pageNumber,
                      pageSize,
                      sortBy,
                      sortDirection
                    }: PaginationParams, postId: string): Promise<PaginatorDto<Comment[]>> {

    type FilterType = {
      [key: string]: unknown
    }
    const filter: FilterType = {};
    if (postId) {
      filter.postId = postId;
    }

    const items = await this.commentsModel.find(filter).sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .limit(pageSize).skip((pageNumber - 1) * pageSize);

    const totalCount = await this.commentsModel.count(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }



  async getAllCommentsByArrayOfPosts({
                         pageNumber,
                         pageSize,
                         sortBy,
                         sortDirection
                       }: PaginationParams, postsId: string[]): Promise<PaginatorDto<Comment[]>> {

    const items = await this.commentsModel.find({ postId: { $in: postsId }}).sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .limit(pageSize).skip((pageNumber - 1) * pageSize);

    const totalCount = await this.commentsModel.count({ postId: { $in: postsId }});
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


}