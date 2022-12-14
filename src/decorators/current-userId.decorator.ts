import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    if (!request.userId) {
      //throw Error("UserIdMiddleware must be used");
      return ''
    }
    return request.userId;
  }
);