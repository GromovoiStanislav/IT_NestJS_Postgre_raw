import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Settings } from "../../settings";


@Injectable()
export class JWT_Service {
  constructor(
    private jwtService: JwtService,
    private settings: Settings
  ) {
  }


  async createAuthJWT(userId: string): Promise<string> {
    return this.jwtService.signAsync({ userId }, { secret: this.settings.SECRET, expiresIn: "5m" });
  };


  async createRefreshJWT(tokenId: string, userId: string, deviceId: string, issuedAt: string): Promise<string> {
    return this.jwtService.signAsync(
      {tokenId, userId, deviceId, issuedAt },
      { secret: this.settings.SECRET, expiresIn: "20m" }
    );
  };


  async getUserIdByAccessToken(token: string): Promise<string | null> {
    try {
      const data = await this.jwtService.verifyAsync(token, { secret: this.settings.SECRET });
      return data.userId;
    } catch (e) {
      return null;
    }
  }


  async getInfoByRefreshToken(token: string) {
    try {
      const data = await this.jwtService.verifyAsync(token, { secret: this.settings.SECRET });
      return {
        userId: data.userId,
        deviceId: data.deviceId,
        tokenId: data.tokenId,
      };
    } catch (e) {
      return null;
    }
  }

}