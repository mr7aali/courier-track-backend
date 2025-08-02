/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { ParcelsService } from './parcels.service';
import type { CreateParcelDto } from './dto/create-parcel.dto';
import type { UpdateParcelDto } from './dto/update-parcel.dto';
import type { UpdateStatusDto } from './dto/update-status.dto';
import type { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('parcels')
@Controller('parcels')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new parcel' })
  create(createParcelDto: CreateParcelDto, @Request() req) {
    return this.parcelsService.create(createParcelDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get all parcels with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.parcelsService.findAll(paginationDto);
  }

  @Get('my-parcels')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get customer parcels' })
  getMyParcels(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.parcelsService.getParcelsByCustomer(
      req.user.userId,
      paginationDto,
    );
  }

  @Get('assigned')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: 'Get assigned parcels for agent' })
  getAssignedParcels(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.parcelsService.getParcelsByAgent(
      req.user.userId,
      paginationDto,
    );
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get parcel statistics' })
  getParcelStats() {
    return this.parcelsService.getParcelStats();
  }

  @Get('track/:trackingId')
  @ApiOperation({ summary: 'Track parcel by tracking ID' })
  trackParcel(@Param('trackingId') trackingId: string) {
    return this.parcelsService.findByTrackingId(trackingId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get parcel by ID' })
  findOne(@Param('id') id: string) {
    return this.parcelsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update parcel' })
  update(@Param('id') id: string, updateParcelDto: UpdateParcelDto) {
    return this.parcelsService.update(id, updateParcelDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update parcel status' })
  updateStatus(
    @Param('id') id: string,
    updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.parcelsService.updateStatus(
      id,
      updateStatusDto,
      req.user.userId,
    );
  }

  @Patch(':id/assign-agent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign agent to parcel' })
  assignAgent(@Param('id') id: string, body: { agentId: string }) {
    return this.parcelsService.assignAgent(id, body.agentId);
  }
}
