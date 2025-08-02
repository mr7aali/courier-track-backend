import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Types } from "mongoose"

export type AgentDocument = Agent & Document

@Schema({ timestamps: true })
export class Agent {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  vehicleType: string

  @Prop({ required: true })
  vehicleNumber: string

  @Prop({ required: true })
  licenseNumber: string

  @Prop({ default: "available", enum: ["available", "busy", "offline"] })
  status: string

  @Prop({ type: Object })
  currentLocation: {
    latitude: number
    longitude: number
    address: string
    timestamp: Date
  }

  @Prop([String])
  serviceAreas: string[]

  @Prop({ default: 0 })
  totalDeliveries: number

  @Prop({ default: 0 })
  successfulDeliveries: number

  @Prop({ default: 0 })
  failedDeliveries: number

  @Prop({ default: 5 })
  rating: number

  @Prop({ default: 0 })
  totalRatings: number

  @Prop()
  profileImage: string

  @Prop()
  emergencyContact: string

  @Prop({ default: true })
  isActive: boolean

  @Prop()
  joinedDate: Date

  @Prop()
  lastActiveAt: Date
}

export const AgentSchema = SchemaFactory.createForClass(Agent)

// Indexes
AgentSchema.index({ userId: 1 })
AgentSchema.index({ status: 1 })
AgentSchema.index({ serviceAreas: 1 })
AgentSchema.index({ rating: -1 })
AgentSchema.index({ isActive: 1 })
