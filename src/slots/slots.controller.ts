import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateSlotDto } from '../common/dto/create-slot.dto';
import { UpdateStatusDto } from '../common/dto/update-status.dto';

@Controller('doctors/:doctorId/slots')
export class DoctorSlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  // GET /doctors/:doctorId/slots
  @Get()
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.slotsService.findByDoctor(doctorId);
  }

  // POST /doctors/:doctorId/slots  - Provider only
  @Post()
  @UseGuards(RolesGuard)
  @Roles('provider')
  create(@Param('doctorId') doctorId: string, @Body() dto: CreateSlotDto) {
    return this.slotsService.create(doctorId, dto);
  }
}

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  // PATCH /slots/:id  { status: "blocked" }  - Provider only
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('provider')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.slotsService.updateStatus(id, dto.status as any);
  }
}
