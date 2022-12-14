import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { GetOneBlogCommand } from "../../blogs/blogs.service";

@ValidatorConstraint({ name: "blogId", async: false })
@Injectable()
export class BlogIdValidator implements ValidatorConstraintInterface {
  constructor(private commandBus: CommandBus) {}

  async validate(value: string, args: ValidationArguments) {
      return !!(await this.commandBus.execute(new GetOneBlogCommand(value)));
  }

  defaultMessage(args: ValidationArguments) {
    return `blog doesn't exist`;
  }
}