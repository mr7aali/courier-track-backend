import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type SettingDocument = Setting & Document

@Schema({ timestamps: true })
export class Setting {
  @Prop({ required: true, unique: true })
  key: string

  @Prop({ required: true })
  value: string

  @Prop()
  description: string

  @Prop({ default: "string", enum: ["string", "number", "boolean", "json"] })
  type: string

  @Prop({ default: "system", enum: ["system", "user", "admin", "pricing"] })
  category: string

  @Prop({ default: false })
  isPublic: boolean
}

export const SettingSchema = SchemaFactory.createForClass(Setting)

// Indexes
SettingSchema.index({ key: 1 })
SettingSchema.index({ category: 1 })
