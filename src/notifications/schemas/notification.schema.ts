import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Types } from "mongoose"

export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  message: string

  @Prop({ required: true, enum: ["email", "sms", "push", "in_app"] })
  type: string

  @Prop({ default: "pending", enum: ["pending", "sent", "failed"] })
  status: string

  @Prop({ default: false })
  isRead: boolean

  @Prop()
  sentAt: Date

  @Prop()
  readAt: Date

  @Prop({ type: Object })
  metadata: any

  @Prop()
  failureReason: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)

// Indexes
NotificationSchema.index({ userId: 1 })
NotificationSchema.index({ status: 1 })
NotificationSchema.index({ type: 1 })
NotificationSchema.index({ isRead: 1 })
NotificationSchema.index({ createdAt: -1 })
