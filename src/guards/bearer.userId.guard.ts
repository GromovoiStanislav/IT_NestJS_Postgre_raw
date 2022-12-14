import {
  CanActivate,
  ExecutionContext,
  Injectable
} from "@nestjs/common";
//import { Observable } from "rxjs";
import { JWT_Service } from "../modules/jwt/jwt.service";

@Injectable()
export class BearerUserIdGuard implements CanActivate {

  constructor(
    private jwtService: JWT_Service) {
  }

  //: boolean | Promise<boolean> | Observable<boolean>
  async canActivate(
    context: ExecutionContext
  ) {
    const request = context.switchToHttp().getRequest();

    let token = request.header("Authorization");
    if (token) {
      token = token.split(" ")[1];
      request.userId = await this.jwtService.getUserIdByAccessToken(token);
    } else {
      request.userId = null;
    }

    return true;
  }
}