import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BlogBannedUsersDocument = HydratedDocument<BlogBanUser>;

@Schema()
export class BlogBanUser {

  @Prop()
  blogId: string;

  @Prop()
  userId: string;

  @Prop()
  login: string;

  @Prop()
  createdAt: string;

  @Prop()
  banReason: string;

}

export const BlogBannedUsersSchema = SchemaFactory.createForClass(BlogBanUser);