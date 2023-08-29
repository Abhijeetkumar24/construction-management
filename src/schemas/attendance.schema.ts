import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { HydratedDocument } from "mongoose";
import { Types } from "mongoose";
import { Property } from "./property.schema";
import { Worker } from "./worker.schema";
import { Admin } from "./admin.schema";

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema()
export class Attendance {

    @Prop({ type: Types.ObjectId, ref:() => Admin })
    adminId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref:() => Worker })
    workerId: Types.ObjectId;

    @Prop({ type : Types.ObjectId, ref:() => Property})
    propertyId: Types.ObjectId;

    @Prop()
    date: Date;

    @Prop()
    status: string;
    
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);