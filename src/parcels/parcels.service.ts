/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { type Model, Types } from 'mongoose';
import { Parcel, ParcelDocument } from './schemas/parcel.schema';
import type { CreateParcelDto } from './dto/create-parcel.dto';
import type { UpdateParcelDto } from './dto/update-parcel.dto';
import type { UpdateStatusDto } from './dto/update-status.dto';
import type { PaginationDto } from '../common/dto/pagination.dto';
import * as QRCode from 'qrcode';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ParcelsService {
  // private parcelModel: Model<ParcelDocument>;

  // constructor(model: Model<ParcelDocument>) {
  //   this.parcelModel = model;
  // }
constructor(@InjectModel(Parcel.name) private parcelModel: Model<ParcelDocument>) {}
  async create(
    createParcelDto: CreateParcelDto,
    customerId: string,
  ): Promise<Parcel> {
    const trackingId = this.generateTrackingId();
    const qrCode = await this.generateQRCode(trackingId);
    const barcode = this.generateBarcode();

    const parcel = new this.parcelModel({
      ...createParcelDto,
      customerId: new Types.ObjectId(customerId),
      trackingId,
      qrCode,
      barcode,
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date(),
          location: createParcelDto.pickupAddress,
          notes: 'Parcel booking created',
          updatedBy: new Types.ObjectId(customerId),
        },
      ],
    });

    return parcel.save();
  }

  async findAll(paginationDto: PaginationDto, filters?: any) {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query = {
        $or: [
          { trackingId: { $regex: search, $options: 'i' } },
          { recipientName: { $regex: search, $options: 'i' } },
          { deliveryAddress: { $regex: search, $options: 'i' } },
        ],
      };
    }

    if (filters) {
      query = { ...query, ...filters };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['createdAt'] = -1;
    }

    const [parcels, total] = await Promise.all([
      this.parcelModel
        .find(query)
        .populate('customerId', 'name email phone')
        .populate('agentId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.parcelModel.countDocuments(query),
    ]);

    return {
      parcels,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Parcel> {
    const parcel = await this.parcelModel
      .findById(id)
      .populate('customerId', 'name email phone')
      .populate('agentId', 'name email phone')
      .exec();

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }
    return parcel;
  }

  async findByTrackingId(trackingId: string): Promise<Parcel> {
    const parcel = await this.parcelModel
      .findOne({ trackingId })
      .populate('customerId', 'name email phone')
      .populate('agentId', 'name email phone')
      .exec();

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }
    return parcel;
  }

  async update(id: string, updateParcelDto: UpdateParcelDto): Promise<Parcel> {
    const parcel = await this.parcelModel
      .findByIdAndUpdate(id, updateParcelDto, { new: true })
      .populate('customerId', 'name email phone')
      .populate('agentId', 'name email phone')
      .exec();

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }
    return parcel;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    updatedBy: string,
  ): Promise<Parcel> {
    const parcel = await this.parcelModel.findById(id);
    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    const { status, notes, location, latitude, longitude } = updateStatusDto;

    const statusUpdate = {
      status,
      timestamp: new Date(),
      location: location || parcel.currentLocation?.address || '',
      notes: notes || '',
      updatedBy: new Types.ObjectId(updatedBy),
    };

    parcel.status = status;
    parcel.statusHistory.push(statusUpdate);

    // Update current location if provided
    if (latitude && longitude) {
      parcel.currentLocation = {
        latitude,
        longitude,
        address: location || '',
        timestamp: new Date(),
      };
    }

    if (status === 'picked_up') {
      parcel.pickedUpAt = new Date();
    } else if (status === 'delivered') {
      parcel.deliveredAt = new Date();
    }

    return parcel.save();
  }

  async assignAgent(parcelId: string, agentId: string): Promise<Parcel> {
    const parcel = await this.parcelModel
      .findByIdAndUpdate(
        parcelId,
        {
          agentId: new Types.ObjectId(agentId),
          status: 'assigned',
        },
        { new: true },
      )
      .populate('customerId', 'name email phone')
      .populate('agentId', 'name email phone')
      .exec();

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Add status history entry
    parcel.statusHistory.push({
      status: 'assigned',
      timestamp: new Date(),
      location: parcel.pickupAddress,
      notes: 'Agent assigned to parcel',
      updatedBy: new Types.ObjectId(agentId),
    });

    return parcel.save();
  }

  async getParcelsByCustomer(customerId: string, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, {
      customerId: new Types.ObjectId(customerId),
    });
  }

  async getParcelsByAgent(agentId: string, paginationDto: PaginationDto) {
    return this.findAll(paginationDto, {
      agentId: new Types.ObjectId(agentId),
    });
  }

  async getParcelStats() {
    const stats = await this.parcelModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalParcels = await this.parcelModel.countDocuments();
    const todayParcels = await this.parcelModel.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const codParcels = await this.parcelModel.countDocuments({
      paymentType: 'cod',
    });
    const totalCodAmount = await this.parcelModel.aggregate([
      { $match: { paymentType: 'cod', status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$codAmount' } } },
    ]);

    return {
      totalParcels,
      todayParcels,
      codParcels,
      totalCodAmount: totalCodAmount[0]?.total || 0,
      statusDistribution: stats,
    };
  }

  private generateTrackingId(): string {
    const prefix = 'TRK';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private generateBarcode(): string {
    return Math.random().toString().slice(2, 14);
  }

  private async generateQRCode(trackingId: string): Promise<string> {
    try {
      return await QRCode.toDataURL(trackingId);
    } catch (error) {
      throw new BadRequestException('Failed to generate QR code');
    }
  }
}
