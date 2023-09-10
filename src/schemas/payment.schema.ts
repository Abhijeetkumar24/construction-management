
import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, HydratedDocument, Types } from "mongoose";

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {

    @Prop()
    email: string;

    @Prop()
    name: string;

    @Prop()
    amount: number;

    @Prop()
    status: string;


}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
