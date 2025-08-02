/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type Model, Types } from 'mongoose';
import { Payment, type PaymentDocument } from './schemas/payment.schema';
import type { CreatePaymentDto } from './dto/create-payment.dto';
import type { PaginationDto } from '../common/dto/pagination.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-07-30.basil',
    });
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    customerId: string,
  ): Promise<Payment> {
    const payment = new this.paymentModel({
      ...createPaymentDto,
      parcelId: new Types.ObjectId(createPaymentDto.parcelId),
      customerId: new Types.ObjectId(customerId),
      status: 'pending',
      transactionId: this.generateTransactionId(),
    });

    return payment.save();
  }

  async createStripePaymentIntent(amount: number, currency = 'usd') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }

  async confirmPayment(
    paymentId: string,
    stripePaymentIntentId?: string,
  ): Promise<Payment> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'completed';
    payment.paidAt = new Date();
    if (stripePaymentIntentId) {
      payment.stripePaymentIntentId = stripePaymentIntentId;
    }

    return payment.save();
  }

  async failPayment(paymentId: string, reason: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'failed';
    payment.failureReason = reason;

    return payment.save();
  }

  async findAll(paginationDto: PaginationDto, filters?: any) {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    let query = {};

    if (filters) {
      query = { ...query, ...filters };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['createdAt'] = -1;
    }

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(query)
        .populate('parcelId', 'trackingId')
        .populate('customerId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments(query),
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPaymentStats() {
    const stats = await this.paymentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const totalRevenue = await this.paymentModel.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const codPayments = await this.paymentModel.countDocuments({
      paymentType: 'cod',
      status: 'completed',
    });
    const onlinePayments = await this.paymentModel.countDocuments({
      paymentType: 'online',
      status: 'completed',
    });

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      codPayments,
      onlinePayments,
      statusDistribution: stats,
    };
  }

  private generateTransactionId(): string {
    const prefix = 'TXN';
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}
