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
    DELETE FROM public."devices";
    `);
  }

  async findAllByUserId(userId: string): Promise<Security[]> {
    return this.dataSource.query(`
    SELECT "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", "ip", "title"
    FROM public."devices";
    WHERE "userId" = $1;
    `, [userId]);
  }

  async findByDeviceId(deviceId: string): Promise<Security | null> {
    return this.dataSource.query(`
    SELECT "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", "ip", "title"
    FROM public."devices";
    WHERE "deviceId" = $1;
    `, [deviceId]);
  }

  async findByTokenId(tokenId: string): Promise<Security | null> {
    return this.dataSource.query(`
    SELECT "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", "ip", "title"
    FROM public."devices";
    WHERE "tokenId" = $1;
    `, [tokenId]);
  }


  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."devices"
    WHERE "deviceId" = $1;
    `, [deviceId]);
  }

  async deleteByTokenId(tokenId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."devices"
    WHERE "tokenId" = $1;
    `, [tokenId]);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."devices"
    WHERE "userId" = $1;
    `, [userId]);
  }

  async deleteAllOtherExcludeDeviceId(deviceId: string, userId: string): Promise<void> {
    await this.dataSource.query(`
    DELETE FROM public."devices"
    WHERE "userId" = $1 and "deviceId" <> $2;
    `, [userId,deviceId]);
  }

}