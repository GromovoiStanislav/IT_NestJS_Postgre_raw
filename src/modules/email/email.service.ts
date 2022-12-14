import * as nodemailer from "nodemailer";
import { Settings } from "../../settings";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  constructor(private settings: Settings) {
  }

  async sendEmail(email: string, subject: string, message: string): Promise<boolean> {

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.settings.EMAIL,
        pass: this.settings.EMAIL_PASSWORD
      }
    });

    try {
      await transport.sendMail({
        from: `Stas <${this.settings.EMAIL}>`,
        to: email,
        subject: subject,
        html: message
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

}
