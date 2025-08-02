/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { Injectable } from "@nestjs/common"
import type { Model } from 'mongoose';
// import { Parcel } from "../parcels/schemas/parcel.schema"
// import { Payment } from "../payments/schemas/payment.schema"
// import { User } from "../users/schemas/user.schema"
// import { Agent } from "../agents/schemas/agent.schema"

import { Injectable } from '@nestjs/common';
import { Parcel } from 'src/parcels/schemas/parcel.schema';
import { User } from 'src/users/schemas/user.schema';
import { Payment } from 'src/payments/schemas/payment.schema';
import { Agent } from 'http';
// import { Model } from 'mongoose';

@Injectable()
export class AnalyticsService {
  private parcelModel: Model<any>;
  private paymentModel: Model<any>;
  private userModel: Model<any>;
  private agentModel: Model<any>;

  constructor(modelFactory: any) {
    this.parcelModel = modelFactory(Parcel.name);
    this.paymentModel = modelFactory(Payment.name);
    this.userModel = modelFactory(User.name);
    this.agentModel = modelFactory(Agent.name);
  }

  async getDashboardStats() {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalParcels,
      todayParcels,
      monthlyParcels,
      totalRevenue,
      monthlyRevenue,
      totalUsers,
      totalAgents,
      activeAgents,
    ] = await Promise.all([
      this.parcelModel.countDocuments(),
      this.parcelModel.countDocuments({ createdAt: { $gte: startOfDay } }),
      this.parcelModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.userModel.countDocuments({ role: 'customer' }),
      this.agentModel.countDocuments(),
      this.agentModel.countDocuments({ status: 'available' }),
    ]);

    return {
      parcels: {
        total: totalParcels,
        today: todayParcels,
        monthly: monthlyParcels,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
      },
      users: {
        total: totalUsers,
      },
      agents: {
        total: totalAgents,
        active: activeAgents,
      },
    };
  }

  async getParcelAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const parcelStats = await this.parcelModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    const statusDistribution = await this.parcelModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const deliveryPerformance = await this.parcelModel.aggregate([
      { $match: { status: { $in: ['delivered', 'failed'] } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      dailyStats: parcelStats,
      statusDistribution,
      deliveryPerformance,
    };
  }

  async getRevenueAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueStats = await this.paymentModel.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            paymentType: '$paymentType',
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    const paymentMethodStats = await this.paymentModel.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$paymentType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      dailyRevenue: revenueStats,
      paymentMethods: paymentMethodStats,
    };
  }

  async getAgentPerformance() {
    const agentStats = await this.agentModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalDeliveries: 1,
          successfulDeliveries: 1,
          failedDeliveries: 1,
          rating: 1,
          successRate: {
            $cond: {
              if: { $eq: ['$totalDeliveries', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$successfulDeliveries', '$totalDeliveries'] },
                  100,
                ],
              },
            },
          },
        },
      },
      { $sort: { successRate: -1 } },
    ]);

    return agentStats;
  }

  async getTopCustomers(limit = 10) {
    const topCustomers = await this.parcelModel.aggregate([
      {
        $group: {
          _id: '$customerId',
          totalParcels: { $sum: 1 },
          totalSpent: { $sum: '$deliveryFee' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: '$customer.name',
          email: '$customer.email',
          totalParcels: 1,
          totalSpent: 1,
        },
      },
      { $sort: { totalParcels: -1 } },
      { $limit: limit },
    ]);

    return topCustomers;
  }

  async getFailedDeliveryAnalysis() {
    const failedDeliveries = await this.parcelModel.aggregate([
      { $match: { status: 'failed' } },
      {
        $group: {
          _id: '$failureReason',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const failedByAgent = await this.parcelModel.aggregate([
      { $match: { status: 'failed' } },
      {
        $lookup: {
          from: 'agents',
          localField: 'agentId',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $lookup: {
          from: 'users',
          localField: 'agent.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$agentId',
          agentName: { $first: '$user.name' },
          failedCount: { $sum: 1 },
        },
      },
      { $sort: { failedCount: -1 } },
    ]);

    return {
      reasonAnalysis: failedDeliveries,
      agentAnalysis: failedByAgent,
    };
  }
}
