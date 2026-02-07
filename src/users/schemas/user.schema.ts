import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  // todo add unique and index
  name: string;
  // @Prop({ required: true, unique: true })
  @Prop({ required: true })
  email: string;
  // @Prop({ required: true, unique: true })
  @Prop({ required: true })
  phone: string;
  @Prop()
  birthDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
