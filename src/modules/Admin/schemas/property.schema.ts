import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Admin } from "./admin.schema";
import { Flat, FlatSchema } from "./flat.schema";
import { MaterialCost, MaterialCostSchema } from "./materialCost.schema";
import { Worker, WorkerSchema } from "./worker.schema";


export type PropertyDocument = HydratedDocument<Property>;

@Schema()
export class Property {

    @Prop({type: Types.ObjectId, ref:() => Admin})
    adminId: Types.ObjectId;

    @Prop()
    location: string;

    @Prop()
    type: string;

    @Prop()
    specifications: string;

    @Prop()
    status: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: () => Worker }], required: false })
    workers?: Types.ObjectId[];

    @Prop({type: [FlatSchema]})
    flats: Flat[];

    @Prop({type: [MaterialCostSchema]})
    materialCost: MaterialCost[];

}

export const PropertySchema = SchemaFactory.createForClass(Property);