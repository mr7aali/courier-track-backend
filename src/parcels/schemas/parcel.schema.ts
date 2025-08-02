import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Document, Types } from 'mongoose';

export type ParcelDocument = Parcel & Document;

@Schema({ timestamps: true })
export class Parcel {
  @Prop({ required: true, unique: true })
  trackingId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  agentId: Types.ObjectId;

  @Prop({ required: true })
  recipientName: string;

  @Prop({ required: true })
  recipientPhone: string;

  @Prop({ required: true })
  pickupAddress: string;

  @Prop({ required: true })
  deliveryAddress: string;

  @Prop({ required: true })
  parcelSize: string;

  @Prop({ required: true })
  parcelType: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true, enum: ['cod', 'prepaid'] })
  paymentType: string;

  @Prop({ default: 0 })
  codAmount: number;

  @Prop({ required: true })
  deliveryFee: number;

  @Prop({
    default: 'pending',
    enum: [
      'pending',
      'assigned',
      'picked_up',
      'in_transit',
      'delivered',
      'failed',
      'cancelled',
    ],
  })
  status: string;

  @Prop()
  scheduledPickupDate: Date;

  @Prop()
  scheduledDeliveryDate: Date;

  @Prop()
  pickedUpAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop()
  qrCode: string;

  @Prop()
  barcode: string;

  @Prop({ type: Object })
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: Date;
  };

  @Prop([
    {
      status: String,
      timestamp: Date,
      location: String,
      notes: String,
      updatedBy: { type: Types.ObjectId, ref: 'User' },
    },
  ])
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    location: string;
    notes: string;
    updatedBy: Types.ObjectId;
  }>;

  @Prop()
  deliveryNotes: string;

  @Prop()
  failureReason: string;

  @Prop({ default: 1 })
  deliveryAttempts: number;

  @Prop()
  estimatedDeliveryTime: Date;

  @Prop({ default: false })
  isFragile: boolean;

  @Prop({ default: false })
  requiresSignature: boolean;

  @Prop()
  specialInstructions: string;
}

export const ParcelSchema = SchemaFactory.createForClass(Parcel);

// Indexes
ParcelSchema.index({ trackingId: 1 });
ParcelSchema.index({ customerId: 1 });
ParcelSchema.index({ agentId: 1 });
ParcelSchema.index({ status: 1 });
ParcelSchema.index({ createdAt: -1 });
ParcelSchema.index({ scheduledPickupDate: 1 });
ParcelSchema.index({ scheduledDeliveryDate: 1 });
