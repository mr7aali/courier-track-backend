/* eslint-disable @typescript-eslint/no-unsafe-argument */
// import { Controller, Get, Post, Patch, Param, Delete, Query, UseGuards, Request } from "@nestjs/common"
// import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
// import type { AgentsService } from "./agents.service"
// import type { CreateAgentDto } from "./dto/create-agent.dto"
// import type { UpdateAgentDto } from "./dto/update-agent.dto"
// import type { UpdateLocationDto } from "./dto/update-location.dto"
// import type { PaginationDto } from "../common/dto/pagination.dto"
// import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard"
// import { RolesGuard } from "../common/guards/roles.guard"

import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AgentsService } from './agents.service';
import { Roles, UserRole } from 'src/common/decorators/roles.decorator';
import { CreateAgentDto } from './dto/create-agent.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

// import { Roles, UserRole } from "../common/decorators/roles.decorator"
@ApiTags('agents')
@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new agent' })
  create(createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all agents with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.agentsService.findAll(paginationDto);
  }

  @Get('available')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get available agents' })
  getAvailableAgents(@Query('serviceArea') serviceArea?: string) {
    return this.agentsService.getAvailableAgents(serviceArea);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get agent statistics' })
  getAgentStats() {
    return this.agentsService.getAgentStats();
  }

  @Get('profile')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: 'Get agent profile' })
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.agentsService.findByUserId(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Update agent' })
  update(@Param('id') id: string, updateAgentDto: UpdateAgentDto) {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Patch(':id/location')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: 'Update agent location' })
  updateLocation(
    @Param('id') id: string,
    updateLocationDto: UpdateLocationDto,
  ) {
    return this.agentsService.updateLocation(id, updateLocationDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: 'Update agent status' })
  updateStatus(@Param('id') id: string, body: { status: string }) {
    return this.agentsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete agent' })
  remove(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }
}
