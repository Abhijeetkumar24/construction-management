import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Types } from 'mongoose';
import { Role } from 'src/interfaces/enum';


export type AdminDocument = HydratedDocument<Admin>;
            

@Schema()
export class Admin {

  
  @Prop()
  name: string;
  
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: Role[];

  @Prop()
  twoFaSecret: string;

  @Prop()
  driveQrCode: string;

}

export const AdminSchema = SchemaFactory.createForClass(Admin)