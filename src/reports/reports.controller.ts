import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import type { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('parcels')
  @ApiOperation({ summary: 'Generate parcels report' })
  async generateParcelReport(
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' = 'csv',
    @Res() res: Response,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateParcelReport(start, end, format, res);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Generate revenue report' })
  async generateRevenueReport(
    startDate: string,
    endDate: string,
    format: 'csv' | 'pdf' = 'csv',
    @Res() res: Response,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.reportsService.generateRevenueReport(start, end, format, res);
  }

  @Get('agents')
  @ApiOperation({ summary: 'Generate agents report' })
  async generateAgentReport(
    format: 'csv' | 'pdf' = 'csv',
    @Res() res: Response,
  ) {
    return this.reportsService.generateAgentReport(format, res);
  }
}
