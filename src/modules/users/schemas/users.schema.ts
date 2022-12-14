import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  id: string;

  @Prop()
  login: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop()
  createdAt: string;

  @Prop(raw({
    confirmationCode: { type: String },
    isConfirmed: { type: Boolean }
  }))
  emailConfirmation: Record<string, any>;

  @Prop(raw({
    recoveryCode: { type: String },
    isConfirmed: { type: Boolean }
  }))
  recoveryPassword: Record<string, any>;

  @Prop(raw({
    isBanned: { type: Boolean },
    banDate: { type: String },
    banReason: { type: String }
  }))
  banInfo: Record<string, any>;
}


export const UserSchema = SchemaFactory.createForClass(User);