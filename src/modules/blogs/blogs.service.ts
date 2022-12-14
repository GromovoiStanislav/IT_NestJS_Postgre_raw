import { BlogsRepository } from "./blogs.repository";
import { ViewBlogDto } from "./dto/view-blog.dto";
import { InputBlogDto } from "./dto/input-blog.dto";
import BlogMapper from "./dto/blogsMapper";
import { PaginationParams } from "../../commonDto/paginationParams.dto";
import { PaginatorDto } from "../../commonDto/paginator.dto";
import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { BlogOwnerDto } from "./dto/blog-owner.dto";
import { GetUserByIdCommand } from "../users/users.service";
import { InputBanBlogDto } from "./dto/input-ban-blog.dto";
import { BanBlogInfo } from "./dto/blog-banInfo.dto";
import dateAt from "../../utils/DateGenerator";
import { InputBanBlogUserDto } from "../users/dto/input-blog-ban-user.dto";
import { CreateBlogBanUserDto } from "./dto/create-blog-ban-user.dto";
import { GetAllPostsByArrayOfBlogIdCommand } from "../posts/posts.service";
import { GetAllCommentsByArrayOfPostIDCommand } from "../comments/comments.service";


//////////////////////////////////////////////////////////////
export class ClearAllBlogsCommand {
  constructor() {
  }
}

@CommandHandler(ClearAllBlogsCommand)
export class ClearAllBlogsUseCase implements ICommandHandler<ClearAllBlogsCommand> {
  constructor(protected blogsRepository: BlogsRepository) {
  }

  async execute(command: ClearAllBlogsCommand) {
    await this.blogsRepository.clearAll();
  }
}

//////////////////////////////////////////////////////////////
export class CreateBlogCommand {
  constructor(public inputBlog: InputBlogDto, public userId: string) {
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    private commandBus: CommandBus,
    protected blogsRepository: BlogsRepository) {
  }

  async execute(command: CreateBlogCommand): Promise<ViewBlogDto> {

    const user = await this.commandBus.execute(new GetUserByIdCommand(command.userId));
    if (!user) {
      throw  new UnauthorizedException();
    }

    const blogOwner: BlogOwnerDto = {
      userId: user.id,
      userLogin: user.login
    };

    const blog = await this.blogsRepository.createBlog(BlogMapper.fromInputToCreate(command.inputBlog, blogOwner));
    return BlogMapper.fromModelToView(blog);
  }
}

//////////////////////////////////////////////////////////////
export class UpdateBlogCommand {
  constructor(public blogId: string, public inputBlog: InputBlogDto, public userId: string) {
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private commandBus: CommandBus,
    protected blogsRepository: BlogsRepository) {
  }

  async execute(command: UpdateBlogCommand): Promise<void> {

    const user = await this.commandBus.execute(new GetUserByIdCommand(command.userId));
    if (!user) {
      throw  new UnauthorizedException();
    }

    const blog = await this.blogsRepository.getOneBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException();
    }

    if (command.userId !== blog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    }
    await this.blogsRepository.updateBlog(command.blogId, BlogMapper.fromInputToUpdate(command.inputBlog));
  }
}

//////////////////////////////////////////////////////////////
export class DeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository) {
  }

  async execute(command: DeleteBlogCommand): Promise<void> {

    const blog = await this.blogsRepository.getOneBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException();
    }

    if (command.userId !== blog.blogOwnerInfo.userId) {
      throw new ForbiddenException();
    }

    await this.blogsRepository.deleteBlog(command.blogId);
  }
}


//////////////////////////////////////////////////////////////
export class GetOneBlogCommand {
  constructor(public blogId: string, public withBlogOwner: boolean = false) {
  }
}

@CommandHandler(GetOneBlogCommand)
export class GetOneBlogUseCase implements ICommandHandler<GetOneBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {
  }

  async execute(command: GetOneBlogCommand): Promise<ViewBlogDto | null> {
    const blog = await this.blogsRepository.getOneBlog(command.blogId);
    if (blog) {
      return BlogMapper.fromModelToView(blog, command.withBlogOwner);
    }
    return null;
  }
}


//////////////////////////////////////////////////////////////
export class GetAllBlogsCommand {
  constructor(public searchName: string, public paginationParams: PaginationParams, public sa: boolean = false) {
  }
}

@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(protected blogsRepository: BlogsRepository) {
  }

  async execute(command: GetAllBlogsCommand): Promise<PaginatorDto<ViewBlogDto[]>> {
    let includeBanned = false;

    if (command.sa) {
      includeBanned = true;
    }

    const result = await this.blogsRepository.getAllBlogs(command.searchName, command.paginationParams, includeBanned);
    return BlogMapper.fromModelsToPaginator(result, command.sa);
  }
}

//////////////////////////////////////////////////////////////
export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {
  }
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
  constructor(
    private commandBus: CommandBus,
    private blogsRepository: BlogsRepository) {
  }

  async execute(command: BindBlogWithUserCommand): Promise<void> {
    const blog = await this.blogsRepository.getOneBlog(command.blogId);
    if (!blog) {
      throw new BadRequestException("blog not found");
    }
    if (blog.blogOwnerInfo.userId) {
      throw new BadRequestException("blogId has user already");
    }

    const user = await this.commandBus.execute(new GetUserByIdCommand(command.userId));
    if (!user) {
      throw new BadRequestException("user not found");
    }

    const blogOwner: BlogOwnerDto = {
      userId: user.id,
      userLogin: user.login
    };

    await this.blogsRepository.bindBlogWithUser(command.blogId, blogOwner);
  }
}


//////////////////////////////////////////////////////////////
export class GetAllBlogsByUserIdCommand {
  constructor(public searchName: string, public paginationParams: PaginationParams, public userId: string) {
  }
}

@CommandHandler(GetAllBlogsByUserIdCommand)
export class GetAllBlogsByUserIdUseCase implements ICommandHandler<GetAllBlogsByUserIdCommand> {
  constructor(protected blogsRepository: BlogsRepository) {
  }

  async execute(command: GetAllBlogsByUserIdCommand): Promise<PaginatorDto<ViewBlogDto[]>> {
    const result = await this.blogsRepository.getAllBlogs(command.searchName, command.paginationParams, false, command.userId);
    return BlogMapper.fromModelsToPaginator(result, false);
  }
}


//////////////////////////////////////////////////////////////
export class BanBlogCommand {
  constructor(public blogId: string, public inputBanBlog: InputBanBlogDto) {
  }
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {
  }

  async execute(command: BanBlogCommand): Promise<void> {

    const banInfo = new BanBlogInfo();
    if (command.inputBanBlog.isBanned) {
      banInfo.isBanned = true;
      banInfo.banDate = dateAt();
    }

    await this.blogsRepository.banBlog(command.blogId, banInfo);
  }
}

////////////////////////////////////////////////////
export class GetIdBannedBlogsCommand {
  constructor() {
  }
}

@CommandHandler(GetIdBannedBlogsCommand)
export class GetIdBannedBlogsUseCase implements ICommandHandler<GetIdBannedBlogsCommand> {
  constructor(protected blogsRepository: BlogsRepository) {
  }

  async execute(command: GetIdBannedBlogsCommand): Promise<string[]> {
    const users = await this.blogsRepository.getBanedBlogs();
    return users.map(user => user.id);
  }
}


////////////////////////////////////////////////////
export class BanUserForBlogCommand {
  constructor(public ownerId: string, public userId: string, public inputBanBlogUserDto: InputBanBlogUserDto) {
  }
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
  constructor(private commandBus: CommandBus,
              private blogsRepository: BlogsRepository) {
  }

  async execute(command: BanUserForBlogCommand): Promise<void> {
    const { blogId, banReason, isBanned } = command.inputBanBlogUserDto;
    if (isBanned) {

      const user = await this.commandBus.execute(new GetUserByIdCommand(command.userId));
      if (!user) {
        throw new NotFoundException("user not found");
      }

      const blog = await this.blogsRepository.getOneBlog(blogId);
      if (!blog) {
        throw new NotFoundException("blog not found");
      }

      if (blog.blogOwnerInfo.userId !== command.ownerId) {
        throw new ForbiddenException();
      }

      const createBlogBanUserDto: CreateBlogBanUserDto = {
        userId: command.userId,
        login: user.login,
        blogId,
        banReason,
        createdAt: dateAt()
      };
      await this.blogsRepository.banUserForBlog(createBlogBanUserDto);
    } else {
      await this.blogsRepository.unbanUserForBlog(command.userId, blogId);
    }
  }
}


////////////////////////////////////////////////////
export class ReturnAllBannedUsersForBlogCommand {
  constructor(public ownerId: string, public blogId: string, public searchLogin: string, public paginationParams: PaginationParams) {
  }
}

@CommandHandler(ReturnAllBannedUsersForBlogCommand)
export class ReturnAllBannedUsersForBlogUseCase implements ICommandHandler<ReturnAllBannedUsersForBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {
  }

  async execute(command: ReturnAllBannedUsersForBlogCommand) {
    const blog = await this.blogsRepository.getOneBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException("blog not found");
    }
    if (blog.blogOwnerInfo.userId !== command.ownerId) {
      throw new ForbiddenException();
    }

    const result = await this.blogsRepository.getAllBannedUsersForBlog(command.blogId, command.searchLogin, command.paginationParams);
    return BlogMapper.fromBannedUserModelsToPaginator(result);
  }
}

////////////////////////////////////////////////////
export class IsUserBannedForBlogCommand {
  constructor(public blogId: string, public userId: string) {
  }
}

@CommandHandler(IsUserBannedForBlogCommand)
export class IsUserBannedForBlogUseCase implements ICommandHandler<IsUserBannedForBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {
  }

  async execute(command: IsUserBannedForBlogCommand): Promise<boolean> {
    return !!(await this.blogsRepository.findBannedUserForBlog(command.blogId, command.userId));

  }
}

//////////////////////////////////////////////////////////////
export class GetAllCommentsForMyBlogsCommand {
  constructor(public ownerId: string, public paginationParams: PaginationParams) {
  }
}

@CommandHandler(GetAllCommentsForMyBlogsCommand)
export class GetAllCommentsForMyBlogsUseCase implements ICommandHandler<GetAllCommentsForMyBlogsCommand> {
  constructor(private commandBus: CommandBus,
              private blogsRepository: BlogsRepository) {
  }

  async execute(command: GetAllCommentsForMyBlogsCommand) {

    const blogsId = (await this.blogsRepository.getAllBlogsByOwnerId(command.ownerId)).map(blog => blog.id);
    const posts = await this.commandBus.execute(new GetAllPostsByArrayOfBlogIdCommand(blogsId));
    const postsId = posts.map(post => post.id);
    const comments = await this.commandBus.execute(new GetAllCommentsByArrayOfPostIDCommand(command.paginationParams, postsId, command.ownerId));

    const postInfo = (postId) => {
      const post = posts.find(post => post.id === postId);
      return {
        id: post.id,
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName
      };
    };

    const items = comments.items.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      likesInfo: comment.likesInfo,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin
      },
      postInfo: postInfo(comment.postId)
    }));

    return { ...comments, items };
  }
}