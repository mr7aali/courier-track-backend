import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { TrackingService } from './tracking.service';
// import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':trackingId')
  @ApiOperation({ summary: 'Get parcel location by tracking ID' })
  getParcelLocation(trackingId: string) {
    return this.trackingService.getParcelLocation(trackingId);
  }

  @Patch(':parcelId/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update parcel location' })
  updateParcelLocation(
    parcelId: string,
    @Body() body: { latitude: number; longitude: number; address?: string },
  ) {
    return this.trackingService.updateParcelLocation(
      parcelId,
      body.latitude,
      body.longitude,
      body.address,
    );
  }

  @Get('agent/:agentId/route')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get optimized route for agent' })
  getRouteOptimization(agentId: string) {
    return this.trackingService.getRouteOptimization(agentId);
  }
}
