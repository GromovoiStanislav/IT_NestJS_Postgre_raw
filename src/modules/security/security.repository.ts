import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Security, SecurityDocument } from "./schemas/security.schema";

@Injectable()
export class SecurityRepository {
  constructor(@InjectModel(Security.name) private securityModel: Model<SecurityDocument>) {
  }

  async clearAll(): Promise<void> {
    await this.securityModel.deleteMany({});
  }

  async findAllByUserId(userId: string): Promise<Security[]> {
    return this.securityModel.find({userId})
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.securityModel.deleteMany({userId})
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.securityModel.findOneAndDelete({deviceId})
  }

  async deleteByTokenId(tokenId: string): Promise<void> {
    await this.securityModel.findOneAndDelete({tokenId})
  }

  async deleteAllOtherExcludeDeviceId(deviceId: string, userId: string): Promise<void> {
    await this.securityModel.deleteMany({userId: userId, deviceId: {$ne: deviceId}})
  }

  async findByDeviceId(deviceId: string): Promise<Security | null> {
    return this.securityModel.findOne({deviceId})
  }

  async findByTokenId(tokenId: string): Promise<Security | null> {
    return this.securityModel.findOne({tokenId})
  }

  async addOrUpdateToken(data: Security): Promise<void> {
    await this.securityModel.findOneAndUpdate({deviceId: data.deviceId}, data, {upsert: true})
  }



}