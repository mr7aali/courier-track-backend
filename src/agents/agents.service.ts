/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { type Model, Types } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { CreateAgentDto } from './dto/create-agent.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AgentsService {
  
  constructor(@InjectModel(Agent.name) private agentModel: Model<AgentDocument>) {}

  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    const agent = new this.agentModel({
      ...createAgentDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      userId: new Types.ObjectId(createAgentDto.userId),
      joinedDate: new Date(),
      lastActiveAt: new Date(),
    });

    return agent.save();
  }

  async findAll(paginationDto: PaginationDto, filters?: any) {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query = {
        $or: [
          { vehicleNumber: { $regex: search, $options: 'i' } },
          { licenseNumber: { $regex: search, $options: 'i' } },
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

    const [agents, total] = await Promise.all([
      this.agentModel
        .find(query)
        .populate('userId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.agentModel.countDocuments(query),
    ]);

    return {
      agents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Agent> {
    const agent = await this.agentModel
      .findById(id)
      .populate('userId', 'name email phone')
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async findByUserId(userId: string): Promise<Agent> {
    const agent = await this.agentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email phone')
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    const agent = await this.agentModel
      .findByIdAndUpdate(id, updateAgentDto, { new: true })
      .populate('userId', 'name email phone')
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async updateLocation(
    id: string,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Agent> {
    const { latitude, longitude, address } = updateLocationDto;

    const agent = await this.agentModel
      .findByIdAndUpdate(
        id,
        {
          currentLocation: {
            latitude,
            longitude,
            address: address || '',
            timestamp: new Date(),
          },
          lastActiveAt: new Date(),
        },
        { new: true },
      )
      .populate('userId', 'name email phone')
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async updateStatus(id: string, status: string): Promise<Agent> {
    const agent = await this.agentModel
      .findByIdAndUpdate(
        id,
        { status, lastActiveAt: new Date() },
        { new: true },
      )
      .populate('userId', 'name email phone')
      .exec();

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    return agent;
  }

  async getAvailableAgents(serviceArea?: string) {
    const query: any = { status: 'available', isActive: true };

    if (serviceArea) {
      query.serviceAreas = { $in: [serviceArea] };
    }

    return this.agentModel
      .find(query)
      .populate('userId', 'name email phone')
      .sort({ rating: -1 })
      .exec();
  }

  async updateDeliveryStats(
    agentId: string,
    isSuccessful: boolean,
  ): Promise<void> {
    const updateQuery = {
      $inc: {
        totalDeliveries: 1,
        ...(isSuccessful
          ? { successfulDeliveries: 1 }
          : { failedDeliveries: 1 }),
      },
    };

    await this.agentModel.findByIdAndUpdate(agentId, updateQuery).exec();
  }

  async getAgentStats() {
    const stats = await this.agentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalAgents = await this.agentModel.countDocuments();
    const activeAgents = await this.agentModel.countDocuments({
      isActive: true,
    });
    const availableAgents = await this.agentModel.countDocuments({
      status: 'available',
    });

    return {
      totalAgents,
      activeAgents,
      availableAgents,
      statusDistribution: stats,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.agentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Agent not found');
    }
  }
}
