import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Property } from "src/schemas/property.schema";


export type SessionDocument = HydratedDocument<Session>;

@Schema()
export class Session {
  @Prop({ type: Types.ObjectId, ref:() => User })
  userId: Types.ObjectId;

  @Prop({default: true})
  isActive: string;

  @Prop({default: Date.now()})
  createdAt: Date;

  @Prop({ default: () => Date.now() + 3600000 }) // Set expiration time to 1 hour from now
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
