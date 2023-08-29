import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Property } from "src/schemas/property.schema";


export type UserDocument = HydratedDocument<User>;

@Schema()
export class BookedFlat {
  @Prop({ type: Types.ObjectId, ref:() => Property })
  propertyId: Types.ObjectId;

  @Prop()
  flatNumber: string;
}

export const BookedFlatSchema = SchemaFactory.createForClass(BookedFlat);
