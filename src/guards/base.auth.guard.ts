import {
  CanActivate,
  ExecutionContext,
  Injectable, UnauthorizedException
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class BaseAuthGuard implements CanActivate {

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.header("Authorization");
    if (!token) {
      throw new UnauthorizedException();
    }
    if (token !== "Basic YWRtaW46cXdlcnR5") {
      throw new UnauthorizedException();
    }

    return true;
  }
}