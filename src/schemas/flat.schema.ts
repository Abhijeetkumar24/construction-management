import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.schema";

export type FlatDocument = HydratedDocument<Flat>;

@Schema()
export class Flat {

    @Prop()
    flatNumber: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    bookedBy: Types.ObjectId;

    @Prop()
    status: string
}

export const FlatSchema = SchemaFactory.createForClass(Flat);