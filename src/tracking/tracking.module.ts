import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { TrackingService } from "./tracking.service"
import { TrackingController } from "./tracking.controller"
import { Parcel, ParcelSchema } from "../parcels/schemas/parcel.schema"
import { Agent, AgentSchema } from "../agents/schemas/agent.schema"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Parcel.name, schema: ParcelSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
  ],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
