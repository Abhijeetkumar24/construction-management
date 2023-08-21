import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Types } from "mongoose";


export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {

    @Prop()
    senderId: Types.ObjectId;

    @Prop()
    receiverId: Types.ObjectId;

    @Prop()
    message: string;

    
}

export const MessageSchema = SchemaFactory.createForClass(Message);