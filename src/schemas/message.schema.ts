// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import { HydratedDocument } from "mongoose";
// import { Types } from "mongoose";


// export type MessageDocument = HydratedDocument<Message>;

// @Schema()
// export class Message {

//     @Prop()
//     senderId: Types.ObjectId;

//     @Prop()
//     receiverId: Types.ObjectId;

//     @Prop()
//     message: string;

    
// }

// export const MessageSchema = SchemaFactory.createForClass(Message);



import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument, Types } from "mongoose";

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {

    @Prop({ required: true, unique:false })
    message: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
    userId: Types.ObjectId;

}


export const MessageSchema = SchemaFactory.createForClass(Message);



// import { User } from '../schemas/user.schema';
// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import mongoose, { Document } from "mongoose";

// export type MessageDocument = Message & Document;




// @Schema({
//     toJSON: {
//         getters: true,
//         virtuals: true,
//     },
//     timestamps: true,
// })
// export class Message {
//     @Prop({ required: true, unique: true })
//     message: string

//     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
//     user: User

// }


// const MessageSchema = SchemaFactory.createForClass(Message)



// export { MessageSchema };