import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Types } from 'mongoose';
import { Role } from 'src/modules/auth/enums/role.enum';


export type AdminDocument = HydratedDocument<Admin>;
            

@Schema()
export class Admin {

  
  @Prop()
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: Role[];

}

export const AdminSchema = SchemaFactory.createForClass(Admin)