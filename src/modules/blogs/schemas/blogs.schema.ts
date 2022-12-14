import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  websiteUrl: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: string;

  @Prop(raw({
    userId: { type: String },
    userLogin: { type: String }
  }))
  blogOwnerInfo: Record<string, any>;

  @Prop(raw({
    isBanned: { type: Boolean },
    banDate: { type: String }
  }))
  banInfo: Record<string, any>;

}

export const BlogSchema = SchemaFactory.createForClass(Blog);