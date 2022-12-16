import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DeviceBdDto } from "./dto/devices-bd.dto";


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

  async findAllByUserId(userId: string): Promise<DeviceBdDto[]> {
    return this.dataSource.query(`
    SELECT "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", "ip", "title"
    FROM public."devices"
    WHERE "userId" = $1;
    `, [userId]);
  }

  async findByDeviceId(deviceId: string): Promise<DeviceBdDto | null> {
    const result = await this.dataSource.query(`
    SELECT "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", "ip", "title"
    FROM public."devices"
    WHERE "deviceId" = $1;
    `, [deviceId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
  }

  async findByTokenId(tokenId: string): Promise<DeviceBdDto | null> {
    const result = await this.dataSource.query(`
    SELECT "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", "ip", "title"
    FROM public."devices"
    WHERE "tokenId" = $1;
    `, [tokenId]);

    if (result.length > 0) {
      return result[0];
    }
    return null;
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
    `, [userId, deviceId]);
  }


  async addOrUpdateToken(data: DeviceBdDto): Promise<void> {
    await this.deleteByDeviceId(data.deviceId);
    await this.createByDeviceId(data);
  }

  async createByDeviceId(data: DeviceBdDto): Promise<void> {
    await this.dataSource.query(`
    INSERT INTO public.devices(
    "tokenId", "deviceId", "userId", "issuedAt", "expiresIn", ip, title)
    VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,[
      data.tokenId,
      data.deviceId,
      data.userId,
      data.issuedAt,
      data.expiresIn,
      data.ip,
      data.title
    ]);
  }



}