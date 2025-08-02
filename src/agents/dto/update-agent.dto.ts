import { PartialType } from "@nestjs/swagger"
import { CreateAgentDto } from "./create-agent.dto"
import { IsOptional, IsEnum } from "class-validator"

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @IsOptional()
  @IsEnum(["available", "busy", "offline"])
  status?: string
}
