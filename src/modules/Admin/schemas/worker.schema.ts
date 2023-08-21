import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Types } from 'mongoose';
import { Admin } from "./admin.schema";


export type WorkerDocument = HydratedDocument<Worker>;


@Schema()
export class Worker {

    @Prop({ type: Types.ObjectId, ref:() => Admin })
    adminId: Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    eamil: string; 

    @Prop()
    availability : string;

    @Prop([String])
    skills: string[];

  
}

export const WorkerSchema = SchemaFactory.createForClass(Worker);