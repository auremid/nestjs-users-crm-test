import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({timestamps: true})
export class User {
  @Prop({ required: true, index: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true, unique: true })
  phone: string;
  @Prop()
  birthDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User)
