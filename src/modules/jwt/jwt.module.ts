import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { JWT_Service } from "./jwt.service";
import { Settings } from "../../settings";

@Module({
  imports: [JwtModule.register({})],
  providers: [JWT_Service, JwtService, Settings],
  exports: [JWT_Service]
})
export class JWT_Module {

}