import { CommandBus } from "@nestjs/cqrs";
import { ClearAllUsersCommand } from "../users/users.service";
import { ClearAllBlogsCommand } from "../blogs/blogs.service";
import { ClearAllPostsCommand } from "../posts/posts.service";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClearAllCommentsCommand } from "../comments/comments.service";
import { ClearAllDevicesCommand } from "../security/security.service";


//////////////////////////////////////////////////////////////////
export class DeleteAllDataCommand {
  constructor() {
  }
}

@CommandHandler(DeleteAllDataCommand)
export class DeleteAllDataUseCase implements ICommandHandler<DeleteAllDataCommand> {
  constructor(private commandBus: CommandBus) {
  }

  async execute(command: DeleteAllDataCommand) {
    await Promise.all([
      this.commandBus.execute(new ClearAllUsersCommand()),
      this.commandBus.execute(new ClearAllDevicesCommand())
    ]).catch(() => {
    });


    await this.commandBus.execute(new ClearAllUsersCommand());
    await this.commandBus.execute(new ClearAllBlogsCommand());
    await this.commandBus.execute(new ClearAllPostsCommand());
    await this.commandBus.execute(new ClearAllCommentsCommand());

  }
}
