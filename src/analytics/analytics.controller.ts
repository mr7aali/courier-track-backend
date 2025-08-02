import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import type { AnalyticsService } from "./analytics.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../common/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"

@ApiTags("analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard statistics" })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats()
  }

  @Get('parcels')
  @ApiOperation({ summary: 'Get parcel analytics' })
  getParcelAnalytics(@Query('days') days?: number) {
    return this.analyticsService.getParcelAnalytics(days);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  getRevenueAnalytics(@Query('days') days?: number) {
    return this.analyticsService.getRevenueAnalytics(days);
  }

  @Get("agents/performance")
  @ApiOperation({ summary: "Get agent performance analytics" })
  getAgentPerformance() {
    return this.analyticsService.getAgentPerformance()
  }

  @Get('customers/top')
  @ApiOperation({ summary: 'Get top customers' })
  getTopCustomers(@Query('limit') limit?: number) {
    return this.analyticsService.getTopCustomers(limit);
  }

  @Get("failed-deliveries")
  @ApiOperation({ summary: "Get failed delivery analysis" })
  getFailedDeliveryAnalysis() {
    return this.analyticsService.getFailedDeliveryAnalysis()
  }
}
