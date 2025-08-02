import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { AnalyticsService } from "./analytics.service"
import { AnalyticsController } from "./analytics.controller"
import { Parcel, ParcelSchema } from "../parcels/schemas/parcel.schema"
import { Payment, PaymentSchema } from "../payments/schemas/payment.schema"
import { User, UserSchema } from "../users/schemas/user.schema"
import { Agent, AgentSchema } from "../agents/schemas/agent.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
