
import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument, Types } from "mongoose";

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {

    @Prop({required: true})
    message: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
    userId: Types.ObjectId;

}

export const MessageSchema = SchemaFactory.createForClass(Message);
