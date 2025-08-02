import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Parcel', required: true })
  parcelId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['cod', 'prepaid', 'online'] })
  paymentType: string;

  @Prop({
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
  })
  status: string;

  @Prop()
  transactionId: string;

  @Prop()
  stripePaymentIntentId: string;

  @Prop()
  paymentMethod: string;

  @Prop()
  paidAt: Date;

  @Prop()
  refundedAt: Date;

  @Prop()
  refundAmount: number;

  @Prop()
  failureReason: string;

  @Prop({ type: Object })
  metadata: any;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ parcelId: 1 });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentType: 1 });
PaymentSchema.index({ createdAt: -1 });
