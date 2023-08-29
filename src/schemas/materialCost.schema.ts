import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type MaterialCostDocument = HydratedDocument<MaterialCost>;

@Schema()
export class MaterialCost {

    @Prop()
    material: string;

    @Prop()
    cost: number;
}

export const MaterialCostSchema = SchemaFactory.createForClass(MaterialCost);