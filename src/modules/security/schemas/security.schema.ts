import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SecurityDocument = HydratedDocument<Security>;

@Schema()
export class Security {

  @Prop()
  tokenId: string;

  @Prop()
  deviceId: string;

  @Prop()
  userId: string;

  @Prop()
  issuedAt: string;

  @Prop()
  expiresIn: string;

  @Prop()
  ip: string;

  @Prop()
  title: string;
}

export const SecuritySchema = SchemaFactory.createForClass(Security);