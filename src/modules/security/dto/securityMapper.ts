import { ViewSecurityDto } from "./view-security.dto";
import { Security } from "../schemas/security.schema";

export class SecurityMapper {
  static fromModelToView(data: Security): ViewSecurityDto {
    const viewSecurity = new ViewSecurityDto();
    viewSecurity.deviceId = data.deviceId;
    viewSecurity.lastActiveDate = data.issuedAt;
    viewSecurity.ip = data.ip;
    viewSecurity.title = data.title;
    return viewSecurity;
  }
}