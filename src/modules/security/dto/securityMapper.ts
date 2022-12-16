import { ViewSecurityDto } from "./view-security.dto";
import { DeviceBdDto } from "./devices-bd.dto";

export class SecurityMapper {
  static fromModelToView(data: DeviceBdDto): ViewSecurityDto {
    const viewSecurity = new ViewSecurityDto();
    viewSecurity.deviceId = data.deviceId;
    viewSecurity.lastActiveDate = data.issuedAt;
    viewSecurity.ip = data.ip;
    viewSecurity.title = data.title;
    return viewSecurity;
  }
}