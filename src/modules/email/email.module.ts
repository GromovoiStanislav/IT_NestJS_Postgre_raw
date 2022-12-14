import { Module } from "@nestjs/common";
import { Settings } from "../../settings";
import { EmailService } from "./email.service";

@Module({
  imports: [],
  providers: [EmailService, Settings],
  exports: [EmailService]
})
export class EmailModule {

}