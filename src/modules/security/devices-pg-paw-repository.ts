import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Security } from "./schemas/security.schema";

@Injectable()
export class DevicesPgPawRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }

  async clearAll(): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."Devices";
    `);
  }

  async findAllByUserId(userId: string): Promise<Security[]> {
    return this.dataSource.query(`
    SELECT "TokenId", "DeviceId", "UserId", "IssuedAt", "ExpiresIn", "Ip", "Title"
    FROM public."Devices";
    WHERE "UserId" = $1;
    `, [userId]);
  }

  async findByDeviceId(deviceId: string): Promise<Security | null> {
    return this.dataSource.query(`
    SELECT "TokenId", "DeviceId", "UserId", "IssuedAt", "ExpiresIn", "Ip", "Title"
    FROM public."Devices";
    WHERE "DeviceId" = $1;
    `, [deviceId]);
  }

  async findByTokenId(tokenId: string): Promise<Security | null> {
    return this.dataSource.query(`
    SELECT "TokenId", "DeviceId", "UserId", "IssuedAt", "ExpiresIn", "Ip", "Title"
    FROM public."Devices";
    WHERE "TokenId" = $1;
    `, [tokenId]);
  }


  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."Devices"
    WHERE "DeviceId" = $1;
    `, [deviceId]);
  }

  async deleteByTokenId(tokenId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."Devices"
    WHERE "TokenId" = $1;
    `, [tokenId]);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."Devices"
    WHERE "UserId" = $1;
    `, [userId]);
  }

  async deleteAllOtherExcludeDeviceId(deviceId: string, userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."Devices"
    WHERE "UserId" = $1 and "DeviceId" <> $2;
    `, [userId,deviceId]);
  }

}