import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigType, ConfigurationType } from "./config/configuration";

@Injectable()
export class AppService {

  constructor(private configService: ConfigService<ConfigType>) {
  }

  getHello(): string {
    // @ts-ignore
    //const db = this.configService.get("db", { infer: true });
    //const MONGO_URI = this.configService.get("db", { infer: true }).mongo.MONGO_URI;
    //const MONGO_URI = this.configService.get("db.mongo.MONGO_URI", { infer: true });
    //const MONGO_URI = this.configService.get("MONGO_URI");

    //return "PORT: " + this.configService.get("PORT");
    return process.env.PORT;
    //return "HELP!!!";
  }
}
