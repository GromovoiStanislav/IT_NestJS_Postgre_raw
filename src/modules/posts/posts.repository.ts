import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument } from "./schemas/posts.schema";
import { CreatePostDto } from "./dto/create-post.dto";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";
import { UpdatePostDto } from "./dto/update-post.dto";


@Injectable()
export class PostsRepository {

  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
  }


  async clearAll(): Promise<void> {
    await this.postModel.deleteMany({});
  }


  async deletePost(postId: string): Promise<Post | null> {
    return this.postModel.findOneAndDelete({ id: postId });
  }


  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    return await createdPost.save();
  }

  async updatePost(postId: string, updatePostDto: UpdatePostDto): Promise<Post | null> {
    return this.postModel.findOneAndUpdate({ id: postId }, updatePostDto);
  }


  async getOnePost(postId: string, banBlogsId: string[] = []): Promise<Post | null> {
    return this.postModel.findOne({ id: postId, blogId: { $nin: banBlogsId } });
  }

  async getAllPosts({
                      pageNumber,
                      pageSize,
                      sortBy,
                      sortDirection
                    }: PaginationParams, blogId: string): Promise<PaginatorDto<Post[]>> {

    type FilterType = {
      [key: string]: unknown
    }
    const filter: FilterType = {};
    if (blogId) {
      filter.blogId = blogId;
    }

    const items = await this.postModel.find(filter).sort({ [sortBy]: sortDirection === "asc" ? 1 : -1 })
      .limit(pageSize).skip((pageNumber - 1) * pageSize);

    const totalCount = await this.postModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);
    const page = pageNumber;

    return { pagesCount, page, pageSize, totalCount, items };
  }


  async getAllPostsByArrayOfBlogsId(blogsId: string[]): Promise<Post[]> {
    return this.postModel.find({ blogId: { $in: blogsId } });
  }


}