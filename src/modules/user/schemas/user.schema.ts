import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Types } from 'mongoose';
import { BookedFlat, BookedFlatSchema } from './BookedFlat.schema';
import { Admin } from 'src/modules/Admin/schemas/admin.schema';
import { Role } from 'src/modules/auth/enums/role.enum';

export type UserDocument = HydratedDocument<User>;


@Schema()
export class User {

  @Prop({ type: Types.ObjectId , ref: () => Admin }) 
  adminId: Types.ObjectId;

  @Prop()
  username: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ type: [BookedFlatSchema] ,required:false}) 
  bookedFlats?: BookedFlat[];

  @Prop()
  role: Role[];

}

export const UserSchema = SchemaFactory.createForClass(User)