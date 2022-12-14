import {
  CanActivate,
  ExecutionContext,
  Injectable, UnauthorizedException
} from "@nestjs/common";
//import { Observable } from "rxjs";
import { JWT_Service } from "../modules/jwt/jwt.service";

@Injectable()
export class BearerAuthGuard implements CanActivate {

  constructor(
    private jwtService: JWT_Service) {
  }

  //: boolean | Promise<boolean> | Observable<boolean>
  async canActivate(
    context: ExecutionContext
  ) {
    const request = context.switchToHttp().getRequest();

    let token = request.header("Authorization");
    if (!token) {
      throw new UnauthorizedException();
    }

    token = token.split(" ")[1];
    const userId = await this.jwtService.getUserIdByAccessToken(token);

    if (!userId) {
      throw new UnauthorizedException();
    }
    request.userId = userId;

    return true;
  }
}