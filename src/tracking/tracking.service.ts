/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import type { Model } from 'mongoose';
import { Parcel, type ParcelDocument } from '../parcels/schemas/parcel.schema';
import { Agent, type AgentDocument } from '../agents/schemas/agent.schema';
import { InjectModel } from '@nestjs/mongoose';
// import { Agent } from 'http';

@Injectable()
export class TrackingService {
  // private parcelModel: Model<>;
  // private agentModel: Model<AgentDocument>;

  // constructor(
  //   parcelModel: Model<ParcelDocument>,
  //   agentModel: Model<AgentDocument>,
  // ) {
  //   this.parcelModel = parcelModel;
  //   this.agentModel = agentModel;
  // }
constructor(@InjectModel(Parcel.name) private parcelModel: Model<ParcelDocument>,
@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) {}
  async getParcelLocation(trackingId: string) {
    const parcel = await this.parcelModel
      .findOne({ trackingId })
      .populate('agentId', 'currentLocation')
      .exec();

    if (!parcel) {
      throw new Error('Parcel not found');
    }

    return {
      parcelId: parcel._id,
      trackingId: parcel.trackingId,
      status: parcel.status,
      currentLocation: parcel.currentLocation,
      agentLocation: parcel.agentId
        ? (parcel.agentId as any).currentLocation
        : null,
      statusHistory: parcel.statusHistory,
      estimatedDeliveryTime: parcel.estimatedDeliveryTime,
    };
  }

  async updateParcelLocation(
    parcelId: string,
    latitude: number,
    longitude: number,
    address?: string,
  ) {
    const parcel = await this.parcelModel.findByIdAndUpdate(
      parcelId,
      {
        currentLocation: {
          latitude,
          longitude,
          address: address || '',
          timestamp: new Date(),
        },
      },
      { new: true },
    );

    return parcel;
  }

  async getRouteOptimization(agentId: string) {
    const agent = await this.agentModel.findById(agentId);
    const assignedParcels = await this.parcelModel
      .find({
        agentId,
        status: { $in: ['assigned', 'picked_up', 'in_transit'] },
      })
      .exec();

    // Simple route optimization logic
    // In production, you would integrate with Google Maps API
    const optimizedRoute = assignedParcels.map((parcel) => ({
      parcelId: parcel._id,
      trackingId: parcel.trackingId,
      address:
        parcel.status === 'assigned'
          ? parcel.pickupAddress
          : parcel.deliveryAddress,
      priority: parcel.status === 'assigned' ? 1 : 2, // Pickup first, then delivery
    }));

    return {
      agentLocation: agent?.currentLocation,
      optimizedRoute: optimizedRoute.sort((a, b) => a.priority - b.priority),
    };
  }
}
