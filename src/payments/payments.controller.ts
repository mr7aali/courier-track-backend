import { Controller, Get, Post, Param, Patch, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import type { PaymentsService } from "./payments.service"
import type { CreatePaymentDto } from "./dto/create-payment.dto"
import type { PaginationDto } from "../common/dto/pagination.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../common/guards/roles.guard"
import { Roles, UserRole } from "../common/decorators/roles.decorator"

@ApiTags("payments")
@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: "Create a new payment" })
  create(createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user.userId)
  }

  @Post("create-intent")
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: "Create Stripe payment intent" })
  createPaymentIntent(body: { amount: number; currency?: string }) {
    return this.paymentsService.createStripePaymentIntent(body.amount, body.currency)
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get all payments with pagination" })
  findAll(paginationDto: PaginationDto) {
    return this.paymentsService.findAll(paginationDto)
  }

  @Get("stats")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Get payment statistics" })
  getPaymentStats() {
    return this.paymentsService.getPaymentStats()
  }

  @Patch(":id/confirm")
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: "Confirm payment" })
  confirmPayment(@Param('id') id: string, body: { stripePaymentIntentId?: string }) {
    return this.paymentsService.confirmPayment(id, body.stripePaymentIntentId)
  }

  @Patch(":id/fail")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Mark payment as failed" })
  failPayment(@Param('id') id: string, body: { reason: string }) {
    return this.paymentsService.failPayment(id, body.reason)
  }
}
